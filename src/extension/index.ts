// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { delay } from "./utils";
import {
  startUpdater,
  stopUpdater,
  isUpdaterRunning,
  updaterPort,
} from "./httpd";
import { findESPProjectPath } from "./esp_project";

// Current ESP Project path fror Updater httpd
let currentProjectPath: string | undefined = undefined;

//
let statusBarItem = vscode.window.createStatusBarItem();

// this method is called when this extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.error("vsc-esp-updater.activate");
  statusBarItem.text = "Update ESP";
  statusBarItem.command = "vsc-esp-updater.start";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  let disposableStart = vscode.commands.registerCommand(
    "vsc-esp-updater.start",
    async () => {
      // path of active text editor
      const activeFilePath =
        vscode.window.activeTextEditor?.document?.uri?.fsPath;
      if (activeFilePath === undefined) {
        vscode.window.showInformationMessage("Can't file active source code.");
        return;
      }

      const activeDirPath = path.dirname(activeFilePath!);
      const projectPath = findESPProjectPath(activeDirPath);
      if (projectPath === undefined) {
        vscode.window.showInformationMessage("Can't find built image file");
        return;
      }

      // stop httpd if changed project path
      if (projectPath !== currentProjectPath) {
        await stopUpdater();
      }

      // start Updater httpd
      if (!isUpdaterRunning()) {
        await startUpdater(projectPath);
        currentProjectPath = projectPath;
        await delay(500);
      }

      // open ESP Updater on your browser
      vscode.env.openExternal(
        vscode.Uri.parse(`http://localhost:${updaterPort()}`)
      );
    }
  );
  context.subscriptions.push(disposableStart);

  let disposableStop = vscode.commands.registerCommand(
    "vsc-esp-updater.stop",
    async () => {
      if (await stopUpdater()) {
        statusBarItem.hide();
      }
    }
  );
  context.subscriptions.push(disposableStop);
}

// this method is called when this extension is deactivated
export function deactivate() {
  stopUpdater();
  statusBarItem.hide();
}
