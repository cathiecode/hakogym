import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, constants } from "node:fs";
import { join } from "node:path";

function execFile(fileName) {
  if (process.platform === "win32") {
    return fileName + ".exe";
  }
  return fileName;
}

function buildWithCargo(project) {
  const result = spawnSync("cargo", ["build", "--release"], {
    cwd: project,
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(result.error);
  }

  copyFileSync(
    join(project, "target", "release", execFile(project)),
    join("build", execFile(project))
  );
}

function buildWithTauriNpm(project, name) {
  const result = spawnSync("npm", ["run", "build"], {
    cwd: project,
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  copyFileSync(
    join(project, "src-tauri", "target", "release", execFile(name)),
    join("build", execFile(project))
  );
}

async function main() {
  rmSync("build", { force: true, recursive: true });
  mkdirSync("build");
  buildWithCargo("service-manager");
  buildWithCargo("time-measurement-system");
  buildWithCargo("time-measurement-system-sensor-io");
  buildWithTauriNpm(
    "time-measurement-system-gui",
    "time-measurement-system-gui"
  );
  copyFileSync(join("resources", "config.json"), join("build", "config.json"));
}

main().catch(console.error);
