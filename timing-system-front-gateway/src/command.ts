import { FastifyInstance } from "fastify";
import { z } from "zod";
import { connection } from "./connection";
import { CreateCompetitionRequest } from "./proto/timing-system_pb";
import { promisify } from "./utils";

export default async function commandRoutes(
  fastify: FastifyInstance,
  options: object
) {
  {
    const RequestType = z.object({
      configurationId: z.string()
    });
    fastify.get("/", async (request, reply) => {
      const requestBody = RequestType.safeParse(request.body);
      if (!requestBody.success) {
        throw 
      }

      const backendRequest = new CreateCompetitionRequest();
      backendRequest.setCompetitionconfigurationid(
        reply.bad
      );
      await promisify((cb) =>
        connection.client.createCompetition(backendRequest, cb)
      );
    });
  }
}
