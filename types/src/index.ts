import { JSONSchemaType } from "ajv/dist/2019";
import Config from "./types/config.json";

export type Metadata = {
  carId: string,
  pylonTouchCount: number,
  derailmentCount: number,
  status?: string,
  removed: boolean,
  heat?: string
}

Config.record.metadata.schema satisfies JSONSchemaType<Metadata>;
