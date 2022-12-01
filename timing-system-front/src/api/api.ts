import { io } from "socket.io-client";

const URL = "http://localhost:8080";

export function subscribeChange(onChange: () => void) {
  const callback = () => {onChange};
  const socket = io(URL).on("change", callback);

  return () => {
    socket.off("change", callback);
  }
}
