import { spawnSync } from "node:child_process";
import fs from "fs-extra";
import { join } from "node:path";

const { copyFileSync, mkdirSync, rmSync, copySync } = fs;

function execFile(fileName) {
  if (process.platform === "win32") {
    return fileName + ".exe";
  }
  return fileName;
}

function buildWithCargo(project) {
  const result = spawnSync("cargo", ["build", "--release", "-p", project], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
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

  if (result.status !== 0) {
    throw new Error(result.error);
  }

  copyFileSync(
    join(project, "src-tauri", "target", "release", execFile(name)),
    join("build", execFile(project))
  );
}

function buildWithNpm(project) {
  const result = spawnSync("npm", ["run", "build"], {
    cwd: project,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(result.error);
  }

  copySync(
    join(project, "build"),
    join("build", project)
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
  buildWithNpm("time-measurement-system-google-spreadsheet-sync");
  buildWithNpm("time-measurement-system-vlc-connection");

  copySync("resources", "build");
  copySync(join("resources", "vlcrc"), join("build", "deps", "vlc", "Data", "settings", "vlcrc"));
}

main().catch(console.error);
