import fastify from "fastify";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema.js";
import { Server } from "http";
import { connection } from "./connection.js";
import fastifyApollo, {
  fastifyApolloDrainPlugin,
} from "@as-integrations/fastify";
import fastifyIO from "fastify-socket.io";
import fastifySensible from "@fastify/sensible";

export async function main(): Promise<void> {
  const app = fastify();

  app.ready().then(() => {
    connection.subscribeChange(() => {
      app.io.emit("change");
    });
  });

  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers: connection.createResolvers(),
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await graphQlServer.start();

  await app.register(fastifyApollo(graphQlServer));
  await app.register(fastifyIO);

  app.listen({
    port: parseInt(process.env.PORT ?? "8080"),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
