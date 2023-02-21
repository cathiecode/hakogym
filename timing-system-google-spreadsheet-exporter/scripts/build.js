#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "fs-extra";

const { copySync, removeSync } = fs;

const run = (cwd, command, args = []) => {
  console.log("Running", command, args);
  spawnSync(command, args, { cwd, stdio: "inherit" });
};

removeSync("build");
run(".", "proto-loader-gen-types", [
  "--includeDirs",
  "../proto/",
  "-O",
  "src/types/generated/",
  "--grpcLib",
  "@grpc/grpc-js",
  "timing-system.proto",
]);
run(".", "tsc");
copySync("../proto/", "build/proto");
