import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import useSWR from "swr";

import { ServiceManagerClient } from "../../types/proto/service_manager.client";
import { getServiceManagerAddress } from "../../api";
import { useCallback, useMemo } from "react";

const client = () =>
  new ServiceManagerClient(
    new GrpcWebFetchTransport({ baseUrl: getServiceManagerAddress() })
  );

export function useServiceStatus() {
  const { mutate, ...status } = useSWR(
    ["service_manager", "status"],
    () => {
      return client().status({}).response;
    },
    {
      refreshInterval: 3000,
    }
  );

  const start = useCallback(
    async (id: string, args?: string[]) => {
      await client().start({
        id,
        args: args ?? [],
        overrideArgs: !!args,
      });

      mutate();
    },
    [mutate]
  );

  const stop = useCallback(
    async (id: string) => {
      await client().stop({
        id,
      });

      mutate();
    },
    [mutate]
  );

  return { start, stop, status };
}

export function createUseServiceStatus<T>(
  serviceId: string,
  getArg: (arg: T) => string[] | undefined
) {
  return () => {
    const service = useServiceStatus();

    const status = useMemo(
      () =>
        service.status.data?.services.find(
          (service) => service.id === serviceId
        ),
      [service.status.data?.services]
    );

    const start = useCallback(async (arg: T) => {
      await service.start(serviceId, getArg(arg));
    }, [service]);

    const stop = useCallback(async () => {
      await service.stop(serviceId);
    }, [service]);

    return {
      status,
      start,
      stop,
    };
  };
}
