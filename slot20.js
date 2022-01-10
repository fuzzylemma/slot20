const { ethers } = require("ethers");
const erc20Abi = require("./erc20.json");

const version = require("./package.json").version;
const { formatUnits } = require("@ethersproject/units");

const DEFAULTS = {
    RPC_URL: "http://127.0.0.1:8545",
    MAX_SLOT: 100,
}

async function findSlot (
  tokenAddress,
  tokenHolderAddress,
  rpcUrl  = DEFAULTS["RPC_URL"],
  maxSlot = DEFAULTS["MAX_SLOT"],
) {

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const token = new ethers.Contract(tokenAddress, erc20Abi, provider);

  let slot = -1;
  let tokenSymbol = tokenAddress;
  let tokenDecimals = 18;

  try {
    tokenDecimals = await token.decimals();
    tokenSymbol = await token.symbol();
  } catch (e) {
    // Its fine if we can't get token symbol
  }

  const holderBal = await token.balanceOf(tokenHolderAddress);
  if (holderBal.eq(ethers.constants.Zero)) {
    return -1;
  }

  // Solidity is key, slot
  // Vyper    is slot, key
  for (let i = 0; i <= maxSlot; i++) {
    const solidtySlot = await provider.getStorageAt(
      tokenAddress,
      ethers.utils.solidityKeccak256(
        ["uint256", "uint256"],
        [tokenHolderAddress, i] // key, slot (solidity)
      )
    );
    const vyperSlot = await provider.getStorageAt(
      tokenAddress,
      ethers.utils.solidityKeccak256(
        ["uint256", "uint256"],
        [i, tokenHolderAddress] // slot, key (vyper)
      )
    );

    let n = ethers.constants.Zero;
    let m = ethers.constants.Zero;

    try {
      n = ethers.BigNumber.from(solidtySlot);
    } catch (e) { }
    try {
      m = ethers.BigNumber.from(vyperSlot);
    } catch (e) { }
      
    if (n.eq(holderBal)) {
        slot = i;
        break;
    } else if (m.eq(holderBal)){
        slot = i;
        break;
    }
  }

  return slot;
};
module.exports = { findSlot };
