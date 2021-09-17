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

      await espTool.flashData(contents, parseInt(addr, 16), i);
      await new Promise((resolve) => setTimeout(resolve, 100));
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
