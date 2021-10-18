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
      const folders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.path) ??
        [];
      console.error("folders", folders);
      let projectsPath: string[] = [];
      for (let folder of folders) {
        projectsPath = projectsPath.concat(findESPProjectPath(folder));
      }

      if (projectsPath.length === 0) {
        vscode.window.showInformationMessage("Can't find built image file");
        return;
      }

      const projectPath = projectsPath[0];
      console.info("projectPath", projectPath);

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
      await delay(1000);
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
