import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./types/generated/timing-system";

import google from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import path from "node:path";

const packageDefinition = protoLoader.loadSync("./proto/timing-system.proto");

const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

async function getGoogleApiAuthorization() {
  const client = await authenticate({
    scopes: "https://www.googleapis.com/auth/spreadsheets",
    keyfilePath: path.join(process.cwd(), "secrets/google-api-secret.json"),
  });

  if (!client.credentials.access_token) {
    throw new Error("Failed to get Google API Credential");
  }

  console.log("Logged in!");

  return client;
}

export default async function main() {
  const sheetId = process.argv[2];

  const auth = await getGoogleApiAuthorization();

  const gsheets = new google.sheets_v4.Sheets({auth});

  const sheet = await gsheets.spreadsheets.get({spreadsheetId: sheetId});

  console.log("Connected with sheet ", sheet.data.properties?.title ?? "<untitled>");

  const client = new proto.timingsystem.TimingSystem(
    "localhost:11001",
    grpc.credentials.createInsecure()
  );

  client.subscribeStateChange({}).on("data", (data) => {
    console.log(data);
  });
}

main();
