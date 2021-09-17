//@ts-ignore
import { EspLoader } from "./esptool";
import { termInit, termClear, termWrite, termWriteln } from "./terminal";
import "./style.scss";

let espTool: any;

function formatMacAddr(macAddr: [number]) {
  return macAddr
    .map((value) => value.toString(16).toUpperCase().padStart(2, "0"))
    .join(":");
}

async function doConnect() {
  await espTool.connect();
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
