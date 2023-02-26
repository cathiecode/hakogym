#!/usr/bin/env node

import fs from "fs-extra";
import { spawnSync } from "node:child_process";
import path from "node:path";

const { copySync, mkdirSync, removeSync } = fs;

const run = (cwd, command, args) => {
  console.log("Running", command, args);
  console.log(spawnSync(command, args, { cwd, stdio: "inherit", shell: true }));
};


/*run("timing-system", "cargo", ["build", "--release"]);
run("timing-system-front-tauri", "npm", ["run", "build"]);
run("timing-system-google-spreadsheet-exporter", "npm", ["run", "build"]);*/
run("timing-system-launcher", "npm", ["run", "build"])

removeSync("build");
mkdirSync("build");
mkdirSync(path.join("build", "data"));

copySync(path.join("timing-system", "target", "release", "timing-system.exe"), path.join("build", "data", "timing-system.exe"));
copySync(path.join("timing-system-front-tauri", "src-tauri", "target", "release", "timing-system-front.exe"), path.join("build", "data", "timing-system-front-tauri.exe"));
copySync(path.join("timing-system-google-spreadsheet-exporter", "build"), path.join("build", "data", "timing-system-google-spreadsheet-exporter"));
copySync(path.join("timing-system-launcher", "src-tauri", "target", "release", "timing-system-launcher.exe"), path.join("build", "timing-system-launcher.exe"));
copySync(path.join("deps", "node18"), path.join("build", "data", "node18"));

