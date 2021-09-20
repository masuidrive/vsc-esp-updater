import * as fs from "fs";
import * as path from "path";

// Search ESP project path
export function findESPProjectPath(projectPath: string, depth = 0): string[] {
  const basename = path.basename(projectPath);
  if (
    projectPath === "" ||
    projectPath === "/" ||
    basename === "node_modules" ||
    depth > 3
  ) {
    return [];
  }

  const builtFilePath = path.join(projectPath, "build", "flasher_args.json");
  if (fs.existsSync(builtFilePath)) {
    return [projectPath];
  }
  const dirents = fs.readdirSync(projectPath, { withFileTypes: true });
  const dirs = dirents
    .filter((dirent) => dirent.isDirectory())
    .map(({ name }) => name);
  let result: string[] = [];
  for (let dir of dirs) {
    result = result.concat(findESPProjectPath(dir, depth + 1));
  }
  return result;
}
