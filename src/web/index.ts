import { termInit, termClear, termWrite, termWriteln, term } from "./terminal";
import { sleep } from "./utils";
import "./style.scss";
import { EspLoader } from "@toit/esptool.js";

export type Partition = {
  name: string;
  data: Uint8Array;
  offset: number;
};

let loader: EspLoader | undefined;

async function doConnect() {
  let port = await navigator.serial.requestPort({
    // filters: [{ usbVendorId: 0x10c4 }],
  });
  await port.open({ baudRate: 115200 });

  loader = new EspLoader(port, { debug: true, logger: console });
  console.log("connecting...");
  await loader.connect();
  try {
    await loader.sync();
    console.log("connected");

    const chipName = await loader.chipName();
    const macAddr = await loader.macAddr();
    await loader.loadStub();
    // await loader.setBaudRate(u, 115200);
    //await loader.setBaudRate(options.baudRate, 921600);
  } finally {
    // await loader.disconnect();
  }
  //}

  console.log("done");
  return true;
}
async function doProgam() {
  //async function doProgam() {
  let project = await (
    await fetch("project.json", {
      cache: "no-cache",
    })
  ).json();

  console.info(project);
  const totalSize = project["files"].reduce(
    (a: any, b: any) => a + b.size,
    0
  ) as number;
  console.info(totalSize);

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
        console.info(
          "progress",
          (wroteSize + (fileSize * idx) / cnt) / totalSize
        );
      }
    );
    wroteSize += fileSize;
    await sleep(100);
  }
}
window.addEventListener("load", () => {
  termInit("terminal");
  document.getElementById("btnConnect")!.addEventListener("click", doConnect);
  // document.getElementById("btnErase")!.addEventListener("click", doErase);
  document.getElementById("btnProgram")!.addEventListener("click", doProgam);
});
