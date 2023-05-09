import toast from "react-hot-toast";

export default function showPromise<T>(
  promise: Promise<T>,
  todo: string | undefined
) {
  return toast.promise(promise, {
    loading: `${todo ?? "処理"}しています…`,
    success: `${todo ?? "成功"}しました。`,
    error: (error) => {
      console.error("bad toast", error);
      try {
        return (
          <div>
            <div>{todo ?? "処理"}できませんでした。</div>
            <div
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                overflowX: "scroll",
              }}
            >
              <pre>
                <code>{String(error).slice(0, 15)}...</code>
              </pre>
            </div>
          </div>
        );
      } catch (e) {
        return "Something went wrong";
      }
    },
  });
}
