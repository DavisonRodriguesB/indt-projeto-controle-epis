import { Request, Response } from "express";
import { z } from "zod";
import { getEpisDoColaborador } from "../services/colaborador-epis.service";
import { sendSuccess } from "../utiils/http-response";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function handleGetEpisDoColaborador(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const epis = await getEpisDoColaborador(id);
  sendSuccess(response, 200, epis, { total: epis.length });
}
