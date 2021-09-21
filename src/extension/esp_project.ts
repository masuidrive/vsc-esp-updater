import * as fs from "fs";
import * as path from "path";

// Search ESP project path
export function findESPProjectPath(projectPath: string, depth = 0): string[] {
  console.log(projectPath);
  const basename = path.basename(projectPath);
  if (
    projectPath === "" ||
    projectPath === "/" ||
    basename === "node_modules" ||
    basename === ".git" ||
    depth > 3
  ) {
    return [];
  }
  if (!fs.existsSync(projectPath)) {
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
    result = result.concat(
      findESPProjectPath(path.join(projectPath, dir), depth + 1)
    );
  }
  return result;
}
