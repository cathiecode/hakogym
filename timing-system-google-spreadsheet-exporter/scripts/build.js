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

  run(".", "npm", [
    "exec",
    "proto-loader-gen-types",
    "--",
    "--includeDirs",
    path.join("..", "proto"),
    "--outDir",
    path.join("src", "types", "generated"),
    "--grpcLib",
    "@grpc/grpc-js",
    "timing-system.proto",
  ]);

  run(".", "npm", ["exec", "tsc"]);

  // run(".", "npm", ["exec", "esbuild", "--", "src/main.ts", "--bundle", "--platform=node", "--outfile=" + path.join("build", "index.js"), "--format=cjs"])

  mkdirSync(path.join("build", "resources"));
  copySync("../proto/", path.join("build", "resources", "proto"));
  copySync("../secrets/", path.join("build", "resources", "secrets"));

})().catch(console.error);
