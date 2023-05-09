import google from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import stableHash from "stable-hash";
import { RecordsClient } from "./types/proto/records.client.js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ReadAllReply } from "./types/proto/records.js";
import path from "path";
import { ChannelCredentials } from "@grpc/grpc-js";

async function getGoogleApiAuthorization(credentialPath: string) {
  const client = await authenticate({
    scopes: "https://www.googleapis.com/auth/spreadsheets",
    keyfilePath: path.join(process.cwd(), credentialPath),
  });

  if (!client.credentials.access_token) {
    throw new Error("Failed to get Google API Credential");
  }

  console.log("Logged in!");

  return client;
}

const TARGET_SHEET_TITLE = "HAS_TIMING_SYSTEM_DATA";

export default async function main() {
  const credentialPath = process.argv[2];
  const spreadsheetId = process.argv[3];
  const spreadsheetStartRow = process.argv[4] ?? "A1";

  const auth = await getGoogleApiAuthorization(credentialPath);

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

  const client = new RecordsClient(
    new GrpcTransport({
      host: "[::1]:11000",
      channelCredentials: ChannelCredentials.createInsecure(),
    })
  );

  let lastUpdatedResultHash: string | null = null;

  const onChange = async (data: ReadAllReply) => {
    console.log("Received change.");

    const resultHash = stableHash(data.item);

    if (resultHash === lastUpdatedResultHash) {
      console.log("Result did not changed. skipping upload");
      return;
    }

    const values = data.item.map((result) => {
      try {
        const meta = JSON.parse(result.meta);

        return [
          meta.carId,
          Number(result.time),
          meta.pylonTouchCount,
          meta.derailmentCount,
          meta.status,
          meta.heat,
        ];
      } catch (e) {
        return [];
      }
    });

    await gsheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: TARGET_SHEET_TITLE + "!" + spreadsheetStartRow,
      valueInputOption: "RAW",

      requestBody: {
        range: TARGET_SHEET_TITLE + "!" + spreadsheetStartRow,
        majorDimension: "ROWS",
        values: values,
      },
    });

    lastUpdatedResultHash = resultHash;

    console.log("Uploaded.");
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
