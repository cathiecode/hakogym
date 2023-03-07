import { invoke, InvokeArgs } from "@tauri-apps/api/tauri";
import toast from "react-hot-toast"

async function command<T extends InvokeArgs, U>(
  command_name: string,
  args: T
): Promise<U> {
  try {
    return await invoke<U>(command_name, args);
  } catch (e) {
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

function typedCommand<T extends InvokeArgs, U>(commandId: string) {
  return async (args: T): Promise<U> => {
    return await command(commandId, args);
  }
}

function runningCarSpecificCommand(commandId: string) {
  return typedCommand<{timestamp: number, trackId: string, carId: string}, void>(commandId);
}

function recordSpecificCommand(commandId: string) {
  return typedCommand<{timestamp: number, recordId: string}, void>(commandId);
}

const markPylonTouch = runningCarSpecificCommand("mark_pylon_touch");
const removePylonTouch = runningCarSpecificCommand("remove_pylon_touch");
const markDerailment = runningCarSpecificCommand("mark_derailment");
const removeDerailment = runningCarSpecificCommand("remove_derailment");
const didNotFinished = runningCarSpecificCommand("did_not_finished");
const missCourse = runningCarSpecificCommand("miss_course");

const markDnfToRecord = recordSpecificCommand("mark_dnf_to_record");
const markMisscourseToRecord = recordSpecificCommand("mark_miss_course_to_record");
const removeRecord = recordSpecificCommand("remove_record");
const recoveryRecord = recordSpecificCommand("recovery_record");

const changeRecordPylonTouchCount = typedCommand<{timestamp: number, recordId: string, count: number}, void>("change_record_pylon_touch_count");
const changeRecordDerailmentCount = typedCommand<{timestamp: number, recordId: string, count: number}, void>("change_record_derailment_count");

export {
  markPylonTouch,
  removePylonTouch,
  markDerailment,
  removeDerailment,
  didNotFinished,
  missCourse,
  markDnfToRecord,
  markMisscourseToRecord,
  removeRecord,
  recoveryRecord,
  changeRecordPylonTouchCount,
  changeRecordDerailmentCount,
}