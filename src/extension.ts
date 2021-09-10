// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const http = require("http");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vsc-esp-updater" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "vsc-esp-updater.helloWorld",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello World from vsc-esp-updater!");
      http
      .createServer((req: any, res: any) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello World\n");
      })
      .listen(3000, () => console.log("Server http://localhost:3000"));
      vscode.env.openExternal(
        vscode.Uri.parse(
          // "https://www.w3schools.com/python/python_functions.asp"
          "http://localhost:3000/"
        )
      );
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
