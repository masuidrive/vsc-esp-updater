import { termInit, termClear, termWrite, termWriteln, term } from "./terminal";
import { sleep, showEl, hideEl } from "./utils";
import { EspLoader } from "@toit/esptool.js";
import { Modal } from "bootstrap";
import "./style.scss";

let navConnectedEl: HTMLElement | undefined;
let navWriteEl: HTMLElement | undefined;
let navSwitchDeviceEl: HTMLElement | undefined;

let modalWrite:Modal | undefined;
let modalResetingEl: HTMLElement | undefined;
let modalStubEl: HTMLElement | undefined;
let modalErrorEl: HTMLElement | undefined;
let modalErrorMessageEl: HTMLElement | undefined;
let modalWritingEl: HTMLElement | undefined;
let modalProgressEl: HTMLElement | undefined;
let modalSuccessEl: HTMLElement | undefined;

let loader: EspLoader | undefined;
const baudRate = 115200;

async function doConnect() {
  let port = await navigator.serial.requestPort({
    // filters: [{ usbVendorId: 0x10c4 }],
  });
  await port.open({ baudRate: baudRate });

  loader = new EspLoader(port, { debug: true, logger: console });
  await loader.connect();

  try {
    await loader.sync();

    const chipName = await loader.chipName();
    const macAddr = await loader.macAddr();
    await loader.loadStub();
    await loader.setBaudRate(baudRate, 921600);
  } finally {
  }

  return true;
}
async function doWrite() {
  hideEl(navConnectedEl!);
  showEl(navUpdatingEl!);
  try {
    let project = await (
      await fetch("project.json", {
        cache: "no-cache",
      })
    ).json();

    const totalSize = project["files"].reduce(
      (a: any, b: any) => a + b.size,
      0
    ) as number;

    let wroteSize = 0;
    for (let i in project["files"]) {
      let file = project["files"][i];
      const fileSize = file["size"];

      let url = `data/${file["address"]}.bin`;
      let contents = await (
        await fetch(url, {
          cache: "no-cache",
        })
      ).arrayBuffer();
      await loader!.flashData(
        new Uint8Array(contents),
        parseInt(file["address"], 16),
        (idx, cnt) => {
          const progress = Math.floor(
            (100 * (wroteSize + (fileSize * idx) / cnt)) / totalSize
          );
          console.info("progress", progress);
          progressEl!.style.width = `${progress}%`;
        }
      );
      wroteSize += fileSize;
      await sleep(100);
    }
  } finally {
    hideEl(navUpdatingEl!);
    showEl(navConnectedEl!);
  }
}
window.addEventListener("load", () => {
  termInit("terminal");
  
  navConnectedEl = document.getElementById("navConnect")!;
  navWriteEl = document.getElementById("navWrite")!;
  navSwitchDeviceEl = document.getElementById("navSwitchDevice")!;
  
  modalWrite = new Modal(document.getElementById("modelWrite")!);
  modalResetingEl = document.getElementById("modalReseting")!;
  modalStubEl = document.getElementById("modalStub")!;
  modalErrorEl = document.getElementById("modalError")!;
  modalErrorMessageEl = document.getElementById("modalErrorMessage")!;
  modalWritingEl = document.getElementById("modalWriting")!;
  modalProgressEl = document.getElementById("modalProgress")!;
  modalSuccessEl = document.getElementById("modalSuccess")!;
  
  document.getElementById("btnConnect")!.addEventListener("click", () => {
    modalWrite.show();
  });
  document.getElementById("btnWrite")!.addEventListener("click", () => {});
  document.getElementById("btnSwitchDevice")!.addEventListener("click", () => {});
  document.getElementById("modalBtnCancel")!.addEventListener("click", () => {});
  document.getElementById("modalBtnClose")!.addEventListener("click", () => {});
  /*
  showEl(navDisconnectedEl!);
  hideEl(navConnectedEl!);
  hideEl(navUpdatingEl!);*/
});
