type StatusProps = {
  status: "ok" | "warn" | "error";
};

const STATUS_COLOR_BG = {
  ok: "#6f6",
  warn: "#ffd",
  error: "#fdd",
};

const STATUS_COLOR_BORDER = {
  ok: "#3d3",
  warn: "#dd3",
  error: "#d33",
};

export default function Status(props: StatusProps) {
  return (
    <div
      style={{
        backgroundColor: STATUS_COLOR_BG[props.status],
        border: `solid 1px ${STATUS_COLOR_BORDER[props.status]}`,
        width: "1em",
        height: "1em",
        margin: "0 0.2em",
        borderRadius: "50%"
      }}
    ></div>
  );
}
