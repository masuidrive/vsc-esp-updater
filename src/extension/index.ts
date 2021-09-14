// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as http from "http";
import * as fs from 'fs';
import * as path from 'path';

const { window } = vscode;
const port = 3232;

let httpd:http.Server | null = null;

function delay(duration:number): Promise<void> {
  return new Promise(function(resolve, reject){
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

function getWorkspacePath():string | null {
  return null;
}

let currentProjectPath:string | undefined = undefined;
function startServer(projectPath:string): Promise<boolean> {
  currentProjectPath = projectPath;
  return new Promise<boolean>(resolve => {
    if(httpd !== null) {
      resolve(false);
    }
    try {
      httpd = http.createServer((req: any, res: any) => {
        if(req.url === '/') {
          res.writeHead(200, { "Content-Type": "text/html" });
          // res.write(fs.readFileSync(path.resolve(__dirname, 'index.html')));
          res.write(currentProjectPath ?? 'unknown');
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

function findProjectPath(codePath:string, count = 0):string | undefined {
  console.error('p', codePath);
  if(codePath === undefined || codePath === '' || codePath === '/' || count > 30) { return undefined; }

  const builtFilePath = path.join(codePath, 'build', 'flasher_args.json');
  if(fs.existsSync(builtFilePath)) {
    return codePath;
    }
  const nextPath = path.dirname(codePath).split(path.sep).pop();
  return findProjectPath(nextPath ?? '/', count + 1);
}

let statusBarItem = window.createStatusBarItem();
export function activate(context: vscode.ExtensionContext) {
  console.error("vsc-esp-updater.activate");
  statusBarItem.text = 'Update　ESP';
  statusBarItem.command = 'vsc-esp-updater.start';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  // console.error(vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor!.document!.uri)）;

  let disposableStart = vscode.commands.registerCommand(
    "vsc-esp-updater.start",
    async () => {
      console.error("vsc-esp-updater.start");
      const codeFilePath = vscode.window.activeTextEditor?.document?.uri?.fsPath;
      console.error(codeFilePath);
      if(codeFilePath === undefined) {
        vscode.window.showInformationMessage("Can't file active source code.");
        return;
      }

      const codePath = path.dirname(codeFilePath!);
      const projectPath = findProjectPath(codePath);
      if(projectPath === undefined) {
        vscode.window.showInformationMessage("Can't find built image file");
        return;
      }
      console.error(projectPath);

      if(projectPath !== currentProjectPath) {
        await stopServer();
        httpd = null;
      }

      if(httpd === null) {
        await startServer(projectPath);
        currentProjectPath = projectPath;
        await delay(1000);
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
}
