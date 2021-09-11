// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as http from "http";
import * as fs from 'fs';
import * as path from 'path';
const { window } = vscode;
const port = 3232;

let httpd:http.Server | null = null;

function startServer(): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    if(httpd !== null) {
      resolve(false);
    }
    try {
      httpd = http.createServer((req: any, res: any) => {
        if(req.url === '/') {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(fs.readFileSync(path.resolve(__dirname, 'index.html')));
        }
        else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.write("404 Not Found " + req.url);
        }
      });
      httpd.listen(port, () => {
        resolve(true);
      });
    }
    catch(e) {
      httpd = null;
      resolve(false);
    }
  });
}

function stopServer(): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    if(httpd === null) {
      resolve(true);
    }
    try {
      httpd?.close();
      resolve(true);
    }
    catch(e) {
      resolve(false);
    }
  });
}

let statusBarItem = window.createStatusBarItem();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBarItem.text = 'ESP32 Update';
  statusBarItem.command = 'vsc-esp-updater.start';
  statusBarItem.show();

  let disposableStart = vscode.commands.registerCommand(
    "vsc-esp-updater.start",
    async () => {
      if(httpd === null) {
        await startServer();
      }

      vscode.env.openExternal(
        vscode.Uri.parse(
          `http://localhost:${port}`
        )
      );
    }
  );
  context.subscriptions.push(disposableStart);

  let disposableStop = vscode.commands.registerCommand(
    "vsc-esp-updater.stop",
    async () => {
      if(await stopServer()) {
        statusBarItem.hide();
      }
    }
  );
  context.subscriptions.push(disposableStop);
}

// this method is called when your extension is deactivated
export function deactivate() {
  stopServer();
  statusBarItem.hide();
}
