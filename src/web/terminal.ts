import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export const term = new Terminal({});

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

export function termWrite(text: string) {
  term.write(text);
}

export function termWriteln(text: string) {
  term.writeln(text);
}
