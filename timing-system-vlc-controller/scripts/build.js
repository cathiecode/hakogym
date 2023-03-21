#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "fs-extra";
import path from "node:path";

const { copySync, removeSync, mkdirSync } = fs;

const run = (cwd, command, args = []) => {
  console.log("Running", command, args);
  spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
};

(async () => {
  removeSync("build");
  mkdirSync(path.join("build"));
  copySync(path.join("..", "resources"), path.join("build", "resources"));

  run(".", "npm", [
    "exec",
    "proto-loader-gen-types",
    "--",
    "--includeDirs",
    path.join("..", "resources", "proto"),
    "--outDir",
    path.join("src", "types", "generated"),
    "--grpcLib",
    "@grpc/grpc-js",
    "timing-system.proto",
  ]);

  run(".", "npm", ["exec", "tsc"]);
})().catch(console.error);
