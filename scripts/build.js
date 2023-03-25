#!/usr/bin/env node

import fs from "fs-extra";
import { spawnSync } from "node:child_process";
import path from "node:path";

const { copySync, mkdirSync, removeSync } = fs;

const run = (cwd, command, args) => {
  console.log("Running", command, args);
  console.log(spawnSync(command, args, { cwd, stdio: "inherit", shell: true }));
};

run("timing-system", "cargo", ["build", "--release"]);
run("timing-system-signal-io", "cargo", ["build", "--release"]);
run("timing-system-front-tauri", "npm", ["run", "build"]);
run("timing-system-time-display", "npm", ["run", "build"]);
run("timing-system-vlc-controller", "npm", ["run", "build"]);
run("timing-system-google-spreadsheet-exporter", "npm", ["run", "build"]);
run("timing-system-launcher", "npm", ["run", "build"]);

removeSync("build");
mkdirSync("build");
mkdirSync(path.join("build", "data"));

copySync(path.join("timing-system", "target", "release", "timing-system.exe"), path.join("build", "data", "timing-system.exe"));
copySync(path.join("timing-system-signal-io", "target", "release", "timing-system-signal-io.exe"), path.join("build", "data", "timing-system-signal-io.exe"));
copySync(path.join("timing-system-front-tauri", "src-tauri", "target", "release", "timing-system-front.exe"), path.join("build", "data", "timing-system-front-tauri.exe"));
copySync(path.join("timing-system-time-display", "src-tauri", "target", "release", "timing-system-time-display.exe"), path.join("build", "data", "timing-system-time-display.exe"));

copySync(path.join("timing-system-google-spreadsheet-exporter", "build"), path.join("build", "data", "timing-system-google-spreadsheet-exporter"));
copySync(path.join("timing-system-google-spreadsheet-exporter", "package.json"), path.join("build", "data", "timing-system-google-spreadsheet-exporter", "package.json"));

copySync(path.join("timing-system-vlc-controller", "build"), path.join("build", "data", "timing-system-vlc-controller"));
copySync(path.join("timing-system-vlc-controller", "package.json"), path.join("build", "data", "timing-system-vlc-controller", "package.json"));

run(path.join("build", "data", "timing-system-google-spreadsheet-exporter"), "npm", ["install", "--omit=dev"]);
run(path.join("build", "data", "timing-system-vlc-controller"), "npm", ["install", "--omit=dev"]);

copySync(path.join("timing-system-launcher", "src-tauri", "target", "release", "timing-system-launcher.exe"), path.join("build", "timing-system-launcher.exe"));
copySync(path.join("deps", "node18"), path.join("build", "data", "node18"));
copySync(path.join("deps", "VLCPortable"), path.join("build", "data", "VLCPortable"));

copySync(path.join("resources"), path.join("build", "resources"));
