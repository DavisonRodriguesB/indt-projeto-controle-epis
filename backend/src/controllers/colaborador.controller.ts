import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { createColaborador, listColaboradores } from "../services/colaborador.service";

const bodySchema = z.object({
  nome: z.string().min(2).max(120),
  matricula: z.string().min(2).max(50),
  setor: z.string().min(2).max(80)
});

export async function handleListColaboradores(_request: Request, response: Response): Promise<void> {
  const colaboradores = await listColaboradores();
  sendSuccess(response, 200, colaboradores, { total: colaboradores.length });
}

export async function handleCreateColaborador(request: Request, response: Response): Promise<void> {
  const payload = bodySchema.parse(request.body);
  const colaborador = await createColaborador(payload);
  sendSuccess(response, 201, colaborador);
}
