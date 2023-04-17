import { RunningObserverClient } from "./types/proto/running_observer.client.js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import * as Vlc from "vlc-client";
import { ChannelCredentials } from "@grpc/grpc-js";
import { ReadAllReply } from "./types/proto/running_observer.js";

export default async function main() {
  const client = new RunningObserverClient(
    new GrpcTransport({
      host: "[::1]:11000", // TODO: Config
      channelCredentials: ChannelCredentials.createInsecure(),
    })
  );

  // TODO: Config
  const vlc = new Vlc.Client({
    ip: "localhost",
    port: 11002,
    username: "timing-system-vlc-controller",
    password: "1234"
  });

  setInterval(async () => {
    try {
      await vlc.getVolume();
    } catch(e) {
      console.error("Failed to get heartbeat due to", e);
      process.abort();
    }
  }, 1000);

  const onChange = async (data: ReadAllReply) => {
    try {
      if (data.item.length === 0) {
        console.log("No running car; skipping");
        return;
      }

      const playlist = await vlc.getPlaylist();
      const playlistLength = playlist.length;

      let carIdAsNumber: number;

      try {
        carIdAsNumber = Number(JSON.parse(data.item[0]?.meta) as {carId: string})
      } catch(e) {
        carIdAsNumber = NaN;
      }

      if (isNaN(carIdAsNumber)) {
        carIdAsNumber = Math.floor(Math.random() * playlistLength);
        console.error("Failed to parse car id so playing random music");
      }

      const playlistPosition = carIdAsNumber % playlistLength;

      const playlistId = playlist[playlistPosition].id

      console.log("playing", playlistId);

      await vlc.playFromPlaylist(playlistId);

    } catch(e) {
      console.error("Failed to play due to", e);
    }
  };

  const connection = client.subscribeChange({});

  (async () => {
    try {
      for await (const response of connection.responses) {
        onChange(response);
      }

      await connection;
    } catch (e) {
      console.log("Connection lost", e);
      throw new Error("Connection lost");
    }
  })();
}

main();
