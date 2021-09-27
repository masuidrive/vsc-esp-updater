import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { sleep } from "./utils";

export const term = new Terminal({});
let port: SerialPort | undefined;
let reader: ReadableStreamDefaultReader | undefined;
let writer: WritableStreamDefaultWriter | undefined;

let isLocalEcho = false;

export function termInit(selector: string) {
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(document.getElementById(selector)!);
  fitAddon.fit();

  window.addEventListener("resize", () => fitAddon.fit());

  term.onKey(termOnKey);
}

export function termClear() {
  term.clear();
}

async function readLoop() {
  while (port?.readable) {
    try {
      reader = port.readable.getReader();
    } catch (error) {
      console.error(error);
      return;
    }
    while (reader) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      term.write(new TextDecoder().decode(value));
    }
  }
}

const textEnc = new TextEncoder(); // always utf-8

function termOnKey(e: { key: string; domEvent: KeyboardEvent }) {
  try {
    const ev = e.domEvent;
    writer?.write(textEnc.encode(e.key));
    if (isLocalEcho) {
      term.write(e.key);
    }
  } catch (e) {
    console.error(e);
  }
}

export async function termLink(port_: SerialPort) {
  if (port === undefined) {
    await termUnlink();
  }
  port = port_;
  writer = port!.writable!.getWriter();

  await readLoop();
}

export async function termUnlink() {
  try {
    reader?.cancel();
    await sleep(1000);

    writer?.releaseLock();
    reader?.releaseLock();
    console.log("termUnlink> unlocked.", reader, writer);
  } catch (e) {
    console.error(e);
  } finally {
    console.log("termUnlink> fin.");
    port = undefined;
    writer = undefined;
    reader = undefined;
  }
}
