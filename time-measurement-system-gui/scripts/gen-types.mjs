import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

spawnSync(
  "npx",
  [
    "protoc",
    "--ts_out",
    "./src/types/proto",
    "--proto_path",
    "../proto",
    "../proto/pending_car_queue.proto",
    "../proto/running_observer.proto",
    "../proto/records.proto",
    "../proto/aggrigated_change_broadcaster.proto",
    "../proto/service_manager.proto",
  ],
  { stdio: "inherit", shell: true }
);

const dir = readdirSync(join("src", "types", "proto"), { withFileTypes: true });

dir
  .filter((item) => item.isFile && item.name.endsWith(".ts"))
  .forEach((item) => {
    const file = readFileSync(join("src", "types", "proto", item.name), {
      encoding: "utf-8",
    });
    writeFileSync(
      join("src", "types", "proto", item.name),
      ["// @ts-nocheck", file].join("\n")
    );
  });
