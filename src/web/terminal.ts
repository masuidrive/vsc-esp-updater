import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export const term = new Terminal({});
let port: SerialPort | undefined;

export function termInit(selector: string) {
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(document.getElementById(selector)!);
  fitAddon.fit();

  window.addEventListener("resize", () => fitAddon.fit());
}

export function termClear() {
  term.clear();
}

async function readLoop() {
  while (port?.readable) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        term.write(new TextDecoder().decode(value));
      }
    } catch (error) {
      console.log("port> 9");
      console.error(error);
      // Handle |error|...
    } finally {
      reader?.releaseLock();
    }
  }
}

const textEnc = new TextEncoder(); // always utf-8

export async function termLink(port_: SerialPort) {
  port = port_;
  readLoop();

  while (port?.writable) {
    const writer = port!.writable.getWriter();
    try {

    term.onKey((e) => {
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      writer.write(textEnc.encode(ev.key));
      /*
      if (ev.DOM_KEY_LOCATION_STANDARD === 13) {
        // term.prompt();
      } else if (ev.key === "\x08") {
        //if (term._core.buffer.x > 2) {
        term.write("\b");
        //}
      } else if (printable) {
        term.write(e.key);
      }*/
    });
  }
}

export function termUnlink() {}
