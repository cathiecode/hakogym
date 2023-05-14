import { spawnSync } from "node:child_process";
import {readFile, writeFile} from "node:fs/promises";
import {join} from "path";

async function main() {
  const file = await readFile(join("..", "resources", "config.json"), "utf-8");

  await writeFile(join("src", "types", "config.json.ts"), `export default ${file.trim()} as const;`);

  const result = spawnSync("npm", ["exec", "tsc"], {stdio: "inherit", shell: true});
  if (result.error) {
    throw Error(result.error);
  }
}

main().catch(console.error);
