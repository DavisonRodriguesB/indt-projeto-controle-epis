import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { listAlertas } from "../services/alerta.service";

const querySchema = z.object({
  diasValidade: z.coerce.number().int().positive().max(365).optional()
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
