import { Router } from "express";
import { connection } from "./connection";
import { CreateCompetitionRequest } from "./proto/timing-system_pb";
import { promisify } from "./utils";

const commandRoute = Router();

commandRoute.get("/competition", (req) => {
  const request = new CreateCompetitionRequest();
  request.setCompetitionconfigurationid(req.body.configurationId);
  await promisify(cb => connection.client.createCompetition(request, cb));
})

commandRoute.get("/competition")

export default commandRoute;
