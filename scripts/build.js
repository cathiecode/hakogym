#!/usr/bin/env node

import {spawnSync} from "node:child_process";


const run = (cwd, command, args) => {
  console.log("Running", command, args);
  spawnSync(command, args, {cwd, stdio: "inherit"});
}

run("timing-system", "cargo", [
  "build",
  "--release",
  "--target=x86_64-pc-windows-gnu",
]); 
run("timing-system-front-tauri", "npm", ["run", "build"]); 
run("timing-system-google-spreadsheet-exporter", "npm", ["run", "build"])
