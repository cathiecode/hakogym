#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFile } from "node:fs";
import path from "node:path";

const run = (cwd, command, args) => {
  console.log("Running", command, args);
  console.log(spawnSync(command, args, { cwd, stdio: "inherit", shell: true }));
};

run("timing-system", "cargo", ["build", "--release"]);
run("timing-system-front-tauri", "npm", ["run", "build"]);
run("timing-system-google-spreadsheet-exporter", "npm", ["run", "build"]);
copyFile(path.join("timing-system", "target", "release", "timing-system.exe"));
copyFile(path.join("timing-system-front-tauri", "target", "release", "timing-system-front-tauri"));
copyFile(path.join("timing-system-google-spreadsheet-", "target", "release", "timing-system-front-tauri"));
