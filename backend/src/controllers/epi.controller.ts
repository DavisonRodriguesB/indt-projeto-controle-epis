import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { createEpi, deleteEpi, entradaSaldoEpi, getEpiById, listEpis, updateEpi } from "../services/epi.service";
import { sendSuccess } from "../utiils/http-response";

const epiBodySchema = z.object({
  codigo: z.string().min(3).max(50).optional(),
  nome: z.string().min(3).max(120),
  ca: z.string().min(2).max(30),
  categoriaId: z.number().int().positive().optional(),
  vidaUtilDias: z.number().int().positive().optional(),
  ativo: z.boolean().optional(),
  validade: z.string().date(),
  estoqueAtual: z.number().int().nonnegative(),
  estoqueMinimo: z.number().int().nonnegative()
});

const saldoBodySchema = z.object({
  quantidade: z.number().int().positive()
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export async function handleListEpis(request: Request, response: Response): Promise<void> {
  const { page, pageSize } = querySchema.parse(request.query ?? {});
  const result = await listEpis({ page, pageSize });

  if (Array.isArray(result)) {
    sendSuccess(response, 200, result, { total: result.length });
    return;
  }

  sendSuccess(response, 200, result.data, {
    total: result.total,
    page,
    pageSize
  });
}

export async function handleGetEpiById(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const epi = await getEpiById(id);

  if (!epi) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, epi);
}

export async function handleCreateEpi(request: Request, response: Response): Promise<void> {
  const payload = epiBodySchema.parse(request.body);
  const epi = await createEpi(payload);
  sendSuccess(response, 201, epi);
}

export async function handleUpdateEpi(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const payload = epiBodySchema.parse(request.body);
  const epi = await updateEpi(id, payload);

  if (!epi) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, epi);
}

export async function handleEntradaSaldoEpi(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const { quantidade } = saldoBodySchema.parse(request.body);
  const epi = await entradaSaldoEpi(id, quantidade);

  if (!epi) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, epi);
}

export async function handleDeleteEpi(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const deleted = await deleteEpi(id);

  if (!deleted) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, { deleted: true });
}
