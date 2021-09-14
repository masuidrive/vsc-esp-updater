import * as http from "http";
import * as fs from "fs";
import * as path from "path";

// ESP updater httpd port #
const port = 3232;

// ESP updater httpd on localhost
let httpd: http.Server | null = null;

export function updaterPort(): number {
  return port;
}

export function isUpdaterRunning(): boolean {
  return httpd !== null;
}

function getAddresses(projectPath: string): [string] | undefined {
  try {
    const flasherArgs = JSON.parse(
      fs.readFileSync(
        path.join(projectPath, "build", "flasher_args.json"),
        "utf8"
      )
    );
    return Object.keys(flasherArgs["flash_files"]) as [string];
  } catch (e) {
    return undefined;
  }
}

function getChipName(projectPath: string): string | undefined {
  try {
    const flasherArgs = JSON.parse(
      fs.readFileSync(
        path.join(projectPath, "build", "flasher_args.json"),
        "utf8"
      )
    );
    return (flasherArgs["chip"] ?? "esp32") as string;
  } catch (e) {
    return undefined;
  }
}

function getProjectName(projectPath: string): string | undefined {
  try {
    const projectDesc = JSON.parse(
      fs.readFileSync(
        path.join(projectPath, "build", "project_description.json"),
        "utf8"
      )
    );
    return projectDesc["project_name"] as string;
  } catch (e) {
    return undefined;
  }
}

// start Updater httpd
export function startUpdater(projectPath: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (httpd !== null) {
      resolve(false);
    }
    try {
      httpd = http.createServer((req: any, res: any) => {
        if (req.url === "/") {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(fs.readFileSync(path.resolve(__dirname, "index.html")));
          res.end();
        } else if (req.url === "/project.json") {
          res.writeHead(200, { "Content-Type": "text/html" });
          // res.write(fs.readFileSync(path.resolve(__dirname, 'index.html')));
          res.write(
            JSON.stringify({
              project_name: getProjectName(projectPath),
              addresses: getAddresses(projectPath),
              chip: getChipName(projectPath),
            })
          );
          res.end();
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.write("404 Not Found " + req.url);
          res.end();
        }
      });
      httpd.listen(port, () => {
        resolve(true);
      });
    } catch (e) {
      httpd = null;
      resolve(false);
    }
  });
}

// stop Updater httpd
export function stopUpdater(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (httpd === null) {
      resolve(true);
    }
    try {
      httpd?.close();
      resolve(true);
    } catch (e) {
      resolve(false);
    }
  });
}
