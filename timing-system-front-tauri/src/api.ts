import supabase from "@supabase/supabase-js";

import { Database } from "../../types/supabase";
import { endpoint, service_role_key } from "./config";

const connection = supabase.createClient<Database>(endpoint, service_role_key);

export async function getEntryList(competitionId: string) {
  return await connection
    .from("competition_entries")
    .select("*")
    .eq("competition_id", competitionId);
}
