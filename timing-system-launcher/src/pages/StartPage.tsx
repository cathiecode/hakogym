import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

type FormData = {
  spreadsheet_id: string;
  spreadsheet_start_row: string;
  com_port: string;
};

type LaunchConfig = {
  google_spreadsheet_id: string;
  google_spreadsheet_start_row: string;
  com_port: string;
};

const launch = async (config: LaunchConfig) => {
  console.log(config);
  console.log(await invoke("launch_request", { config: config }));
};

const getComPortList = async (): Promise<string[]> => {
  const comPorts = await invoke("get_com_list");
  return comPorts as string[];
};

export default function StartPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      spreadsheet_start_row: "A1"
    }
  });

  const [comPortList, setComPortList] = useState<string[]>([]);

  useEffect(() => {
    setInterval(async () => {
      setComPortList(await getComPortList());
    }, 5000);
  });

  const navigate = useNavigate();

  const onSubmit = handleSubmit((data) => {
    navigate("/status");
    setTimeout(() => {
      console.log("Launch");
      launch({
        google_spreadsheet_id: data.spreadsheet_id,
        google_spreadsheet_start_row: data.spreadsheet_start_row,
        com_port: data.com_port
      });
    }, 1000); // Dirty hack
  });

  return (
    <div>
      <h1>HAS Timing System</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>
            出力先Google スプレッドシート:
            <input
              {...register("spreadsheet_id", {
                validate: (input) => {
                  if (input.match("/")) {
                    return "URLが指定されました。スプレッドシートIDを指定してください。（例: 4y-4xEItrNEnoat98abTNU4ay7pjcNJqc）";
                  }
                },
              })}
            />
          </label>
        </div>
        <details>
        <div>
          <summary>Google スプレッドシート詳細設定</summary>
          <label>
            開始行:
            <input
              {...register("spreadsheet_start_row", {
                validate: (input) => {
                  if (!input.match(/[A-Z]+[0-9]+/)) {
                    return "開始行は[A-Z]+[0-9]+の形式を取る必要があります。（例: A1、A31）";
                  }
                },
              })}
            />
          </label>
        </div>
        </details>
        <div>{errors.spreadsheet_id?.message ?? ""}</div>
        <div>
          <label>
            計測器シリアルポート:
            <select
              {...register("com_port", {
                required: "COMポートを指定してください",
              })}
            >
              {comPortList.map(com => <option value={com}>{com}</option>)}
            </select>
          </label>
        </div>
        <div>{errors.com_port?.message ?? ""}</div>
        <button>開始</button>
      </form>
    </div>
  );
}
