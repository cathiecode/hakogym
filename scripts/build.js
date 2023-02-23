#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const run = (cwd, command, args) => {
  console.log("Running", command, args);
  console.log(spawnSync(command, args, { cwd, stdio: "inherit", shell: true }));
};

run("timing-system", "cargo", ["build", "--release"]);
run("timing-system-front-tauri", "npm", ["run", "build"]);
run("timing-system-google-spreadsheet-exporter", "npm", ["run", "build"]);
