import { arrayBufferToString } from "./utils";
import "./style.scss";
//@ts-ignore
import { ESPLoader } from "./ESPLoader";
//@ts-ignore
import { Transport } from "./webserial";
import { Terminal } from "xterm";
const ESP_ROM_BAUD = 115200;

export class App {
  esploader: ESPLoader | undefined;
  terminal: Terminal | undefined;
  transport: Transport | undefined;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
  }

  async connect(device: SerialPort): Promise<boolean> {
    this.transport = new Transport(device);

    try {
      this.esploader = new ESPLoader(
        this.transport,
        ESP_ROM_BAUD,
        this.terminal
      );
      await this.esploader.main_fn();
      await this.esploader.flash_id();
      console.log("Settings done");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async disconnect() {
    this.transport = undefined;
    this.esploader.transport = undefined;
    this.esploader = undefined;
  }

  async progam(): Promise<boolean> {
    if (this.esploader === undefined) {
      return false;
    }
    try {
      let project = await (
        await fetch("project.json", {
          cache: "no-cache",
        })
      ).json();

      let files = [];
      for (let i in project["addresses"]) {
        let addr = project["addresses"][i];
        let url = `data/${addr}.bin`;
        let contents = await (
          await fetch(url, {
            cache: "no-cache",
          })
        ).arrayBuffer();
        files.push({
          data: arrayBufferToString(contents),
          address: parseInt(addr, 16),
        });
      }
      try {
        await this.esploader.write_flash({ fileArray: files });
      } catch (e) {
        console.error(e);
      }
      console.log("done");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
