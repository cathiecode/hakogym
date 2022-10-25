import { initTRPC } from "@trpc/server";

const trpc = initTRPC.create();

const appRouter = trpc.router({
  open: trpc.procedure
    .input(() => {})
    .query(() => {
      
    })
});

export type AppRouter = typeof appRouter;
