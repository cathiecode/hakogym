import { TimingSystemClient } from "./proto/timing-system_grpc_pb";
import { credentials } from "@grpc/grpc-js";
import {
  GetCurrentTracksReply,
  GetCurrentTracksRequest,
  GetRegisteredNextCarReply,
  GetRegisteredNextCarRequest,
} from "./proto/timing-system_pb";
import { promisify } from "./utils";

export default function createResolver() {
  const client = new TimingSystemClient(
    "localhost:11001",
    credentials.createInsecure()
  );

  return {
    Query: {
      currentTracks: async () => {
        const request = new GetCurrentTracksRequest();
        const result = await promisify<GetCurrentTracksReply>((cb) =>
          client.getCurrentTracks(request, cb)
        );
        return result.getTrackidList().map((id) => ({ id }));
      },
    },
    Track: {
      nextCar: async (track) => {
        const request = new GetRegisteredNextCarRequest();
        request.setTrackid(track.id);
        const result = await promisify<GetRegisteredNextCarReply>((cb) =>
          client.getRegisteredNextCar(request, cb)
        );
        return {
          bibId: result.getCarid(),
        };
      },
    },
  };
}
