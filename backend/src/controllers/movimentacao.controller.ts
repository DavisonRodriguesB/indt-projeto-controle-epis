import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { listMovimentacoesRecentes } from "../services/alerta.service";
import {
  createEntradaSaldoMovimentacao,
  createEntregaMovimentacao
} from "../services/movimentacao.service";
import { sendSuccess } from "../utiils/http-response";

const itemSchema = z.object({
  epiId: z.number().int().positive(),
  quantidade: z.number().int().positive()
});

const entregaSchema = z.object({
  colaboradorId: z.number().int().positive(),
  itens: z.array(itemSchema).min(1),
  dataMovimentacao: z.string().date().optional(),
  observacao: z.string().max(500).optional()
});

const entradaSchema = z.object({
  itens: z.array(itemSchema).min(1),
  dataMovimentacao: z.string().date().optional(),
  observacao: z.string().max(500).optional()
});

const movimentacoesQuerySchema = z.object({
  limite: z.coerce.number().int().positive().max(50).optional()
});

export async function handleListMovimentacoesRecentes(request: Request, response: Response): Promise<void> {
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

export async function handleCreateMovimentacaoEntrega(request: Request, response: Response): Promise<void> {
  if (!request.authUser) {
    throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
  }

  const payload = entregaSchema.parse(request.body);
  const created = await createEntregaMovimentacao(
    payload.colaboradorId,
    payload.itens,
    request.authUser.id,
    payload.dataMovimentacao,
    payload.observacao
  );

  sendSuccess(response, 201, created);
}

export async function handleCreateMovimentacaoEntradaSaldo(request: Request, response: Response): Promise<void> {
  if (!request.authUser) {
    throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
  }

  const payload = entradaSchema.parse(request.body);
  const created = await createEntradaSaldoMovimentacao(
    payload.itens,
    request.authUser.id,
    payload.dataMovimentacao,
    payload.observacao
  );

  sendSuccess(response, 201, created);
}
