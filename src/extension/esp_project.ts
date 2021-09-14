import * as fs from "fs";
import * as path from "path";

// Search ESP project path
export function findESPProjectPath(
  codePath: string,
  count = 0
): string | undefined {
  if (codePath === "" || codePath === "/" || count > 30) {
    return undefined;
  }

  const builtFilePath = path.join(codePath, "build", "flasher_args.json");
  if (fs.existsSync(builtFilePath)) {
    return codePath;
  }
  const nextPath = codePath.split(path.sep).slice(0, -1).join(path.sep);
  return findESPProjectPath(nextPath ?? "/", count + 1);
}
