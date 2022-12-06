import { invoke, InvokeArgs } from "@tauri-apps/api/tauri";
import toast from "react-hot-toast"

async function command<T extends InvokeArgs, U>(
  command_name: string,
  args: T
): Promise<U> {
  try {
    return await invoke<U>(command_name, args);
  } catch (e) {
    alert(e);
    console.error(e);
    toast.error(`${e}`);
    throw e;
  }
}

export async function createCompetition(args: {
  configurationId: string;
}): Promise<void> {
  return await command("create_competition", args);
}

export async function start(args: {
  timestamp: number;
  trackId: string;
}): Promise<void> {
  return await command("start", args);
}

export async function stop(args: {
  timestamp: number;
  trackId: string;
  carId?: string;
}): Promise<void> {
  return await command("stop", args);
}

export async function registerNextCar(args: {
  timestamp: number;
  carId: string;
  trackId: string;
}): Promise<void> {
  return await command("register_next_car", args);
}
