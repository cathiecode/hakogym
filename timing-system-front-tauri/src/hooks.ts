import { useQuery } from "@tanstack/react-query";
import { getEntryList } from "./api";

export function useEntryList(competitionId: string) {
  return useQuery(["entryList", competitionId], () => getEntryList(competitionId));
}
