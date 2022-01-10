//const slot = require("./src/slot20");
const slot = require("slotter");

const main = async () => {
    console.log("slotting");
    let wallet   = "0x6b5ae44e4de9283b4dd22d8a0c7f07aa80ff775c"
    let contract = "0xB91124eCEF333f17354ADD2A8b944C76979fE3EC"
    console.log(await slot.findSlot(contract, wallet)) // 51
}
main()
