import { spawnSync } from "node:child_process";
import path from "node:path";

spawnSync("protoc", [
  `--plugin=protoc-gen-ts_proto=${path.join("node_modules", ".bin", "protoc-gen-ts_proto.cmd")}`,
  `--ts_out=${path.join("src", "types")}`,
  "--ts_opt=target=web,no_namespace",
  `-I${path.join("..", "proto")}`,
  path.join("..", "proto", "pending_car_queue.proto"),
  path.join("..", "proto", "running_observer.proto"),
  path.join("..", "proto", "records.proto"),
], {stdio: "inherit"});
// NEW: npx protoc --ts_out ./src/types/proto --proto_path ..\proto\ ..\proto\pending_car_queue.proto^C