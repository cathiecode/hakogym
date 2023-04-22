import { Button, Container } from "react-bootstrap";
import Page from "../ui/Page";
import { open, save } from "@tauri-apps/api/dialog";
import { useCallback } from "react";
import { FilePersistanceClient } from "../types/proto/file_persistance.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getFilePersistanceAddress } from "../api";
import showPromise from "../ui/toast";

export default function File() {
  const openFile = useCallback(async () => {
    const file = await open({
      multiple: false,
      filters: [
        {
          name: "HAS Time measurement system project",
          extensions: ["hasjson"],
        },
      ],
    });

    if (typeof file !== "string") {
      return null;
    }

    // FIXME: refactor
    const client = new FilePersistanceClient(
      new GrpcWebFetchTransport({ baseUrl: getFilePersistanceAddress() })
    );

    showPromise(client.load({file}).response, "ファイルを開く");
  }, []);

  const saveFile = useCallback(async () => {
    const file = await save({
      filters: [
        {
          name: "HAS Time measurement system project",
          extensions: ["hasjson"],
        },
      ],
    });

    if (typeof file !== "string") {
      return null;
    }

    // FIXME: refactor
    const client = new FilePersistanceClient(
      new GrpcWebFetchTransport({ baseUrl: getFilePersistanceAddress() })
    );

    console.log("saving to ", file);

    showPromise(client.save({file}).response, "ファイルに保存");
  }, []);

  return (
    <Page>
      <Container fluid>
        <Button onClick={saveFile}>保存</Button>
        <Button onClick={openFile}>読み込み</Button>
      </Container>
    </Page>
  );
}
