//@ts-ignore
import { EspLoader } from "./esptool";
import { termInit, termClear, termWrite, termWriteln, term } from "./terminal";
import "./style.scss";
//@ts-ignore
import { ESPLoader } from "./ESPLoader";
//@ts-ignore
import { Transport } from "./webserial";

let espTool: any;

function formatMacAddr(macAddr: [number]) {
  return macAddr
    .map((value) => value.toString(16).toUpperCase().padStart(2, "0"))
    .join(":");
}
const ESP_ROM_BAUD = 115200;

async function doConnect() {
  let device = await navigator.serial.requestPort({
    filters: [{ usbVendorId: 0x10c4 }],
  });
  let transport = new Transport(device);

  try {
    let esploader = new ESPLoader(transport, ESP_ROM_BAUD, term);
    let connected = true;

    let chip = await esploader.main_fn();

    await esploader.flash_id();
    console.log("Settings done for :" + chip);
  } catch (e) {}
}

async function doErase() {
  await espTool.eraseFlash();
}

async function doProgam() {
  try {
    if (await espTool.sync()) {
      termWriteln("Bootload mode on " + (await espTool.chipName()));
      termWriteln("MAC Address: " + formatMacAddr(espTool.macAddr()));
      espTool = await espTool.runStub();
    }

    let files = await (
      await fetch("data/files.json", {
        cache: "no-cache",
      })
    ).json();

    for (let i in files["addresses"]) {
      let addr = files["addresses"][i];
      let url = "data/" + String(addr).replace("0x", "") + ".bin";
      let contents = await (
        await fetch(url, {
          cache: "no-cache",
        })
      ).arrayBuffer();
      /*
    let fileArr = [];
    let offset = 0x1000;
    var rowCount = table.rows.length;
    var row;
    for (let index = 1; index < rowCount; index ++) {
        row = table.rows[index];
        var offSetObj = row.cells[0].childNodes[0];
        offset = parseInt(offSetObj.value);

        var fileObj = row.cells[1].childNodes[0];

        fileArr.push({data:fileObj.data, address:offset});
    }
    esploader.write_flash({fileArray: fileArr, flash_size: 'keep'});
*/
    }
    console.log("done");
  } catch (e) {
    console.error(e);
  }
}

window.addEventListener("load", () => {
  espTool = new EspLoader({
    updateProgress: console.log,
    logMsg: termWrite,
    debugMsg: console.log,
    debug: console.log,
    monitor: termWrite,
  });
  termInit("terminal");
  document.getElementById("btnConnect")!.addEventListener("click", doConnect);
  // document.getElementById("btnErase")!.addEventListener("click", doErase);
  document.getElementById("btnProgram")!.addEventListener("click", doProgam);
});
/*

consoleStartButton.onclick = async () => {
    if (device === null) {
        device = await navigator.serial.requestPort({
            filters: [{ usbVendorId: 0x10c4 }]
        });
        transport = new Transport(device);
    }
    lblConsoleFor.style.display = "block";
    consoleStartButton.style.display = "none";
    consoleStopButton.style.display = "initial";
    programDiv.style.display = "none";

    await transport.connect();

    while (true) {
        let val = await transport.rawRead();
        if (typeof val !== 'undefined') {
            term.write(val);
        } else {
            break;
        }
    }
    console.log("quitting console");
}
*/
