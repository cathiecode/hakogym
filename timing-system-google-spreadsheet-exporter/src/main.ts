import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./types/generated/timing-system";

const packageDefinition = protoLoader.loadSync(
  "./proto/timing-system.proto"
);

const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

export default function main() {
  const client = new proto.timingsystem.TimingSystem(
    "localhost:11001",
    grpc.credentials.createInsecure()
  );

  client.subscribeStateChange({}).on("data", (data) => {
    console.log(data);
  });
}

main();
