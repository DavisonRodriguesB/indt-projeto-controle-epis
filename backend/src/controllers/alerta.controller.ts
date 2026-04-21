import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { listAlertas, listEventosRecentes, listMovimentacoesRecentes } from "../services/alerta.service";
import { AppError } from "../middlewares/error-handler";

const querySchema = z.object({
  diasValidade: z.coerce.number().int().positive().max(365).optional()
});

const movimentacoesQuerySchema = z.object({
  limite: z.coerce.number().int().positive().max(50).optional()
});

const eventosQuerySchema = z.object({
  limite: z.coerce.number().int().positive().max(50).optional()
});

export async function handleListAlertas(request: Request, response: Response): Promise<void> {
  const query = querySchema.parse(request.query);
  const diasValidade = query.diasValidade ?? 30;
  const alertas = await listAlertas(diasValidade);

  sendSuccess(response, 200, alertas, {
    diasValidade,
    totalValidade: alertas.validade.length,
    totalEstoqueMinimo: alertas.estoqueMinimo.length
  });
}

export async function handleListAlertasMovimentacao(request: Request, response: Response): Promise<void> {
  if (!request.authUser) {
    throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
  }

  const query = movimentacoesQuerySchema.parse(request.query);
  const limite = query.limite ?? 8;
  const movimentacoes = await listMovimentacoesRecentes(request.authUser, limite);

  sendSuccess(response, 200, movimentacoes, {
    limite,
    total: movimentacoes.length,
    role: request.authUser.role
  });
}

export async function handleListAlertasEventos(request: Request, response: Response): Promise<void> {
  if (!request.authUser) {
    throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
  }

  const query = eventosQuerySchema.parse(request.query);
  const limite = query.limite ?? 8;
  const eventos = await listEventosRecentes(request.authUser, limite);

  sendSuccess(response, 200, eventos, {
    limite,
    total: eventos.length,
    role: request.authUser.role
  });
}
