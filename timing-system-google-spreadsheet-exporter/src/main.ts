import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./types/generated/timing-system";

import google from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import path from "node:path";
import { SubscribeStateChangeReply } from "./types/generated/timingsystem/SubscribeStateChangeReply";
import { StateTree } from "./types/timing-system";
import stableHash from "stable-hash";

const packageDefinition = protoLoader.loadSync(
  "./resources/proto/timing-system.proto"
);

const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

async function getGoogleApiAuthorization() {
  const client = await authenticate({
    scopes: "https://www.googleapis.com/auth/spreadsheets",
    keyfilePath: path.join(
      process.cwd(),
      "resources",
      "secrets",
      "google-api-secret.json"
    ),
  });

  if (!client.credentials.access_token) {
    throw new Error("Failed to get Google API Credential");
  }

  console.log("Logged in!");

  return client;
}

const TARGET_SHEET_TITLE = "HAS_TIMING_SYSTEM_DATA";

export default async function main() {
  const spreadsheetId = process.argv[2];

  const auth = await getGoogleApiAuthorization();

  const gsheets = new google.sheets_v4.Sheets({ auth });

  const spreadSheet = await gsheets.spreadsheets.get({ spreadsheetId });

  console.log(
    "Connected with sheet ",
    spreadSheet.data.properties?.title ?? "<untitled>"
  );

  const targetSheet = spreadSheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === TARGET_SHEET_TITLE
  );

  if (!targetSheet) {
    throw new Error(
      `Failed to find sheet named ${TARGET_SHEET_TITLE}. Please create new sheet titled "${TARGET_SHEET_TITLE}".`
    );
  }

  const client = new proto.timingsystem.TimingSystem(
    "localhost:11001",
    grpc.credentials.createInsecure()
  );

  let lastUpdatedResultHash: string | null = null;

  client
    .subscribeStateChange({})
    .on("data", async (data: SubscribeStateChangeReply) => {
      if (!data.state) {
        console.log("Failed to get state. skipping upload");
        return;
      }

      console.log("Received change.");

      const state = JSON.parse(data.state) as StateTree;

      const resultHash = stableHash(state.records);

      if (resultHash === lastUpdatedResultHash) {
        console.log("Result did not changed. skipping upload");
        return;
      }

      const values = Object.values(state.records).map(
        (result) => [
          result.competition_entry_id,
          result.duration,
          result.pylon_touch_count,
          result.derailment_count,
          result.state,
          result.record_type,
        ]
      );

      await gsheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: "A1",
        valueInputOption: "RAW",
        requestBody: {
          range: "A1",
          majorDimension: "ROWS",
          values: values,
        },
      });

      lastUpdatedResultHash = resultHash;

      console.log("Uploaded.");
    });
}

main();
