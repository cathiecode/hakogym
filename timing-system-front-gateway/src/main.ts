import express, { json } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema.js";
import { expressMiddleware } from "@apollo/server/express4";
import createResolvers from "./resolvers.js";

export async function main(): Promise<void> {
  const app = express();

  const resolvers = createResolvers();

  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers: resolvers
  })

  await graphQlServer.start();

  app.use(
    "/query",
    cors({ origin: "*" }),
    json(),
    expressMiddleware(graphQlServer)
  );

  app.listen(process.env.PORT ?? 8080);
}

main().catch(e => {console.error(e); process.exit(1)});

/*
  const client = new TimingSystemClient("localhost:11001", credentials.createInsecure());

  const request = new CreateCompetitionRequest();

  request.setTimestamp(Date.now());
  request.setCompetitionconfigurationid("test");

  const result = await promisify<CommandReply>(cb => client.createCompetition(request, cb));

  console.log(greeting());
*/
