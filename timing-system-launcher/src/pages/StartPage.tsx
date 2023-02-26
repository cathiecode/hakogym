import { invoke } from "@tauri-apps/api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

type FormData = {
  spreadsheet_id: string;
};

const launch = async () => {
  console.log(await invoke('launch_request', {config: {}}));
}

export default function StartPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();

  const onSubmit = handleSubmit((data) => {
    navigate("/status");
    setTimeout(() => {
      console.log("Launch");
      launch();
    }, 1000) // Dirty hack
  });

  return (
    <div>
      <h1>HAS Timing System</h1>
      <form onSubmit={onSubmit}>
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
        <div>{errors.spreadsheet_id?.message ?? ""}</div>
        <button>開始</button>
      </form>
    </div>
  );
}
