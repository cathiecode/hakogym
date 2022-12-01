import { TimingSystemClient } from "./proto/timing-system_grpc_pb";
import { credentials } from "@grpc/grpc-js";
import {
  GetCurrentTracksReply,
  GetCurrentTracksRequest,
  GetRegisteredNextCarReply,
  GetRegisteredNextCarRequest,
  SubscribeStateChangeRequest,
} from "./proto/timing-system_pb";
import { promisify } from "./utils";

export default class Connections {
  client: TimingSystemClient;

  constructor() {
    this.client = new TimingSystemClient(
      "localhost:11001",
      credentials.createInsecure()
    );
  }

  createResolvers() {
    return {
      Query: {
        currentTracks: async () => {
          const request = new GetCurrentTracksRequest();
          const result = await promisify<GetCurrentTracksReply>((cb) =>
            this.client.getCurrentTracks(request, cb)
          );
          return result.getTrackidList().map((id) => ({ id }));
        },
      },
      Track: {
        nextCar: async (track) => {
          const request = new GetRegisteredNextCarRequest();
          request.setTrackid(track.id);
          const result = await promisify<GetRegisteredNextCarReply>((cb) =>
            this.client.getRegisteredNextCar(request, cb)
          );
          return {
            bibId: result.getCarid(),
          };
        },
      },
    };
  }

  

  subscribeChange(callback: () => void) {
    this.client.subscribeStateChange(new SubscribeStateChangeRequest()).on("data", (value) => {
      callback();
    })
  }
}

export const connection = new Connections();