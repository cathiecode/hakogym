import { spawnSync } from "node:child_process";

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
  ],
  { stdio: "inherit", shell: true }
);
