import { termInit, termClear, termLink, termUnlink, term } from "./terminal";
import { sleep, showEl, hideEl } from "./utils";
import { EspLoader } from "@toit/esptool.js";
import { Modal } from "bootstrap";
import "./style.scss";

let navConnectEl: HTMLElement | undefined;
let navWriteEl: HTMLElement | undefined;
let navSwitchDeviceEl: HTMLElement | undefined;

let modalWrite: Modal | undefined;
let modalResetingEl: HTMLElement | undefined;
let modalStubEl: HTMLElement | undefined;
let modalErrorEl: HTMLElement | undefined;
let modalErrorMessageEl: HTMLElement | undefined;
let modalWritingEl: HTMLElement | undefined;
let modalProgressEl: HTMLElement | undefined;
let modalSuccessEl: HTMLElement | undefined;
let modalBtnCancelEl: HTMLElement | undefined;
let modalBtnCloseEl: HTMLElement | undefined;

let port: SerialPort | undefined;
let loader: EspLoader | undefined;
const baudRate = 115200;

async function doConnect() {
  port = await navigator.serial.requestPort({
    // filters: [{ usbVendorId: 0x10c4 }],
  });

  port.addEventListener("disconnect", (ev) => {
    termUnlink();
    port = undefined;
    loader?.disconnect();
    loader = undefined;
  });

  port.addEventListener("connect", (ev) => {
    termLink(port!);
  });

  await port.open({ baudRate: baudRate });
  hideEl(navConnectEl!);
  showEl(navWriteEl!);
}

async function resetDevice() {
  await port?.setSignals({ dataTerminalReady: false, requestToSend: true });
  sleep(100);
  await port?.setSignals({ dataTerminalReady: true, requestToSend: false });
  sleep(100);
}

async function doWrite() {
  await termUnlink();

  hideEl(modalResetingEl!);
  hideEl(modalStubEl!);
  hideEl(modalErrorEl!);
  hideEl(modalWritingEl!);
  hideEl(modalSuccessEl!);
  showEl(modalBtnCancelEl!);
  hideEl(modalBtnCloseEl!);

  modalWrite!.show();
  try {
    loader = new EspLoader(port!, { debug: false, logger: console });

    showEl(modalResetingEl!);
    await loader!.connect();
    await loader!.sync();
    hideEl(modalResetingEl!);

    showEl(modalStubEl!);
    const chipName = await loader!.chipName();
    const macAddr = await loader!.macAddr();
    await loader!.loadStub();
    await loader!.setBaudRate(baudRate, 921600);
    hideEl(modalStubEl!);

    showEl(modalWritingEl!);
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
          modalProgressEl!.style.width = `${progress}%`;
        }
      );
      wroteSize += fileSize;
      await sleep(100);
    }
    hideEl(modalWritingEl!);
    showEl(modalSuccessEl!);
  } catch (err) {
    if (typeof err === "string") {
      modalErrorMessageEl!.innerText = err as string;
    } else if (err instanceof Error) {
      modalErrorMessageEl!.innerText = err.message;
    } else {
      modalErrorMessageEl!.innerText = "Unknown error";
    }
    showEl(modalErrorEl!);
  } finally {
    await loader?.disconnect();

    resetDevice();
    termLink(port!);

    hideEl(modalBtnCancelEl!);
    showEl(modalBtnCloseEl!);
  }
}

async function doModalCancel() {}
window.addEventListener("load", () => {
  termInit("terminal");

  navConnectEl = document.getElementById("navConnect")!;
  navWriteEl = document.getElementById("navWrite")!;
  navSwitchDeviceEl = document.getElementById("navSwitchDevice")!;

  hideEl(navWriteEl!);
  hideEl(navSwitchDeviceEl!);

  modalWrite = new Modal(document.getElementById("modalWrite")!);
  modalResetingEl = document.getElementById("modalReseting")!;
  modalStubEl = document.getElementById("modalStub")!;
  modalErrorEl = document.getElementById("modalError")!;
  modalErrorMessageEl = document.getElementById("modalErrorMessage")!;
  modalWritingEl = document.getElementById("modalWriting")!;
  modalProgressEl = document.getElementById("modalProgress")!;
  modalSuccessEl = document.getElementById("modalSuccess")!;

  modalBtnCancelEl = document.getElementById("modalBtnCancel")!;
  modalBtnCloseEl = document.getElementById("modalBtnClose")!;

  document.getElementById("btnConnect")!.addEventListener("click", () => {
    doConnect();
  });
  document.getElementById("btnWrite")!.addEventListener("click", () => {
    doWrite();
  });
  document.getElementById("btnClear")!.addEventListener("click", () => {
    term?.clear();
  });
  document.getElementById("btnSwitchDevice")!.addEventListener("click", () => {
    //
  });
  document.getElementById("modalBtnCancel")!.addEventListener("click", () => {
    doModalCancel();
  });
  document.getElementById("modalBtnClose")!.addEventListener("click", () => {
    //
  });
  /*
  showEl(navDisconnectedEl!);
  hideEl(navConnectedEl!);
  hideEl(navUpdatingEl!);*/
});
