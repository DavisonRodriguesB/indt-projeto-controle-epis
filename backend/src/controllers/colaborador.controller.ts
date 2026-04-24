import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { sendSuccess } from "../utiils/http-response";
import {
  createColaborador,
  deleteColaborador,
  listColaboradores,
  updateColaborador,
  getColaboradorById
} from "../services/colaborador.service";
const bodySchema = z.object({
  nome: z.string().min(3).max(120),
  matricula: z.string().min(3).max(50),
  cargo_id: z.number().int().positive(), 
  setor_id: z.number().int().positive(), 
  status: z.boolean().optional()
});


const paramsSchema = z.object({
  id: z.coerce.string() 
});

export async function handleListColaboradores(_request: Request, response: Response): Promise<void> {
  const colaboradores = await listColaboradores();
  sendSuccess(response, 200, colaboradores, { total: colaboradores.length });
}

export async function handleGetColaboradorById(request: Request, response: Response): Promise<void> {
  // Log de debug para ver no terminal do Docker o que está chegando
  console.log(`[Controller] Iniciando busca para ID: ${request.params.id}`);
  
  const { id } = paramsSchema.parse(request.params);
  const colaborador = await getColaboradorById(id);

  if (!colaborador) {
    throw new AppError(404, "Colaborador não encontrado.", "COLABORADOR_NOT_FOUND");
  }

  sendSuccess(response, 200, colaborador);
}

export async function handleCreateColaborador(request: Request, response: Response): Promise<void> {
  const payload = bodySchema.parse(request.body);
  const colaborador = await createColaborador(payload);
  sendSuccess(response, 201, colaborador);
}

export async function handleUpdateColaborador(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const payload = bodySchema.parse(request.body);
  const colaborador = await updateColaborador(id, payload);

  if (!colaborador) {
    throw new AppError(404, "Colaborador não encontrado.", "COLABORADOR_NOT_FOUND");
  }

  sendSuccess(response, 200, colaborador);
}

export async function handleDeleteColaborador(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const deleted = await deleteColaborador(id);

  if (!deleted) {
    throw new AppError(404, "Colaborador não encontrado.", "COLABORADOR_NOT_FOUND");
  }

  sendSuccess(response, 200, { deleted: true });
}