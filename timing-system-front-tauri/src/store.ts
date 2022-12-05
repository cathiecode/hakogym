import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { InvokeArgs } from "@tauri-apps/api/tauri";

export function useAppState<T>(queryCommand: string, options: InvokeArgs) {
  return useQuery<T>({
    queryKey: [queryCommand, options],
    queryFn: () => invoke(queryCommand, options)
  });
}
