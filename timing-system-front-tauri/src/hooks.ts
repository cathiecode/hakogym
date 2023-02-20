import { useQuery } from "@tanstack/react-query";

export function useEntryList(competitionId: string) {
  return useQuery(["entryList", competitionId], () => getEntryList(competitionId));
}
