import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as VLC from "vlc-client";
import { ProtoGrpcType } from "./types/generated/timing-system";

import { SubscribeStateChangeReply } from "./types/generated/timingsystem/SubscribeStateChangeReply";
import { StateTree } from "./types/timing-system";

const packageDefinition = protoLoader.loadSync(
  "./resources/proto/timing-system.proto"
);

const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;


export default async function main() {
  const client = new proto.timingsystem.TimingSystem(
    "localhost:11001",
    grpc.credentials.createInsecure()
  );

  let current_playing_id: number | null = null;

  client
    .subscribeStateChange({})
    .on("data", async (data: SubscribeStateChangeReply) => {
      if (!data.state) {
        console.log("Failed to get state. update");
        return;
      }

      const state = JSON.parse(data.state) as StateTree;

      // FIXME: 複数トラック?
      const current_running_car_id = Number(state.tracks["0"]?.running_cars[0]?.id);

      if (Number.isNaN(current_running_car_id)) {
        console.log("Failed get runnnig car. ignoring event.");
        return;
      }

      if (current_playing_id === current_running_car_id) {
        console.log("Playing id is same. ignoring event.");
        return null;
      }

      current_playing_id = current_running_car_id;

      const vlc = new VLC.Client({
        ip: "localhost",
        port: 11010,
        username: "timing-system-vlc-controller",
        password: "1234"
      });

      vlc.playFromPlaylist(current_running_car_id);
    });
}

main();
