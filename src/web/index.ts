import { termInit, termClear, termWrite, termWriteln, term } from "./terminal";
import { arrayBufferToString } from "./utils";
import "./style.scss";
import { App } from "./app";

let app: App | undefined;

async function doConnect() {
  let device = await navigator.serial.requestPort({
    // filters: [{ usbVendorId: 0x10c4 }],
  });
  app = new App(term);
  app.connect(device);
}

async function doProgam() {
  app?.progam();
}

window.addEventListener("load", () => {
  /*espTool = new EspLoader({
    updateProgress: console.log,
    logMsg: termWrite,
    debugMsg: console.log,
    debug: console.log,
    monitor: termWrite,
  });*/
  termInit("terminal");
  document.getElementById("btnConnect")!.addEventListener("click", doConnect);
  // document.getElementById("btnErase")!.addEventListener("click", doErase);
  document.getElementById("btnProgram")!.addEventListener("click", doProgam);
});
