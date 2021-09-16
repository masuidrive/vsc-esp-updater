import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

let term = new Terminal({});
export function initTerminal(selector: string) {
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(document.getElementById(selector)!);
  fitAddon.fit();
  term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
}

export function clearTerminal() {
  term.clear();
}

export function writeTerminal(text: string) {
  term.write(text);
}
