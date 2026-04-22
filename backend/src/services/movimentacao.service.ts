import { In } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { ColaboradorEntity } from "../entities/colaborador.entity";
import { EpiEntity } from "../entities/epi.entity";
import { MovimentacaoItemEntity } from "../entities/movimentacao-item.entity";
import { MovimentacaoEntity } from "../entities/movimentacao.entity";
import { UserEntity } from "../entities/user.entity";
import { AppError } from "../middlewares/error-handler";
import { AuthUser } from "../types/auth";

interface MovimentacaoItemInput {
  epiId: number;
  quantidade: number;
}

export interface MovimentacaoRecente {
  id: number;
  protocolo: string;
  tipo: "entrega" | "entrada_saldo";
  dataMovimentacao: string;
  observacao: string | null;
  usuarioId: number;
  usuarioNome: string;
  colaboradorId: number | null;
  colaboradorNome: string | null;
  totalItens: number;
  totalQuantidade: number;
}

function getProtocolYear(dataMovimentacao: unknown): string {
  if (typeof dataMovimentacao === "string") {
    const isoYear = dataMovimentacao.match(/^(\d{4})/);
    if (isoYear) {
      return isoYear[1];
    }
  }

  const parsed = new Date(String(dataMovimentacao));
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getUTCFullYear());
  }

  return String(new Date().getUTCFullYear());
}

function ensureNoDuplicateEpi(items: MovimentacaoItemInput[]): void {
  const ids = items.map((item) => item.epiId);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new AppError(400, "Nao e permitido repetir epi_id na mesma movimentacao.", "MOVIMENTACAO_DUPLICATE_EPI");
  }
}

export async function createEntregaMovimentacao(
  colaboradorId: number,
  items: MovimentacaoItemInput[],
  usuarioId: number,
  dataMovimentacao?: string,
  observacao?: string
): Promise<{ id: number }> {
  ensureNoDuplicateEpi(items);

  return AppDataSource.transaction(async (manager) => {
    const colaborador = await manager.findOne(ColaboradorEntity, { where: { id: colaboradorId, status: true } });
    if (!colaborador) {
      throw new AppError(404, "Colaborador nao encontrado ou inativo.", "COLABORADOR_NOT_FOUND");
    }

    const usuario = await manager.findOne(UserEntity, { where: { id: usuarioId } });
    if (!usuario) {
      throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
    }

    const epis = await manager.find(EpiEntity, {
      where: { id: In(items.map((item) => item.epiId)) }
    });

    if (epis.length !== items.length) {
      throw new AppError(404, "Um ou mais EPIs nao foram encontrados.", "EPI_NOT_FOUND");
    }

    for (const item of items) {
      const epi = epis.find((row) => row.id === item.epiId)!;
      if (!epi.ativo) {
        throw new AppError(400, "Nao e permitido movimentar EPI inativo.", "EPI_INATIVO");
      }

      if (epi.estoqueAtual < item.quantidade) {
        throw new AppError(400, "Estoque insuficiente para entrega.", "EPI_INSUFFICIENT_STOCK", {
          epiId: epi.id,
          estoqueAtual: epi.estoqueAtual,
          quantidadeSolicitada: item.quantidade
        });
      }
    }

    const movimentacao = manager.create(MovimentacaoEntity, {
      tipo: "entrega",
      colaboradorId,
      usuarioId,
      dataMovimentacao: dataMovimentacao ?? new Date().toISOString().slice(0, 10),
      observacao: observacao ?? null
    });

    const savedMov = await manager.save(movimentacao);

    for (const item of items) {
      const epi = epis.find((row) => row.id === item.epiId)!;
      epi.estoqueAtual = epi.estoqueAtual - item.quantidade;
      await manager.save(epi);

      const vencimento = new Date(savedMov.dataMovimentacao);
      vencimento.setDate(vencimento.getDate() + epi.vidaUtilDias);

      const movItem = manager.create(MovimentacaoItemEntity, {
        movimentacaoId: savedMov.id,
        epiId: item.epiId,
        quantidade: item.quantidade,
        dataVencimento: vencimento.toISOString().slice(0, 10)
      });

      await manager.save(movItem);
    }

    return { id: savedMov.id };
  });
}

export async function createEntradaSaldoMovimentacao(
  items: MovimentacaoItemInput[],
  usuarioId: number,
  dataMovimentacao?: string,
  observacao?: string
): Promise<{ id: number }> {
  ensureNoDuplicateEpi(items);

  return AppDataSource.transaction(async (manager) => {
    const usuario = await manager.findOne(UserEntity, { where: { id: usuarioId } });
    if (!usuario) {
      throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
    }

    const epis = await manager.find(EpiEntity, {
      where: { id: In(items.map((item) => item.epiId)) }
    });

    if (epis.length !== items.length) {
      throw new AppError(404, "Um ou mais EPIs nao foram encontrados.", "EPI_NOT_FOUND");
    }

    for (const item of items) {
      const epi = epis.find((row) => row.id === item.epiId)!;
      if (!epi.ativo) {
        throw new AppError(400, "Nao e permitido movimentar EPI inativo.", "EPI_INATIVO");
      }
    }

    const movimentacao = manager.create(MovimentacaoEntity, {
      tipo: "entrada_saldo",
      colaboradorId: null,
      usuarioId,
      dataMovimentacao: dataMovimentacao ?? new Date().toISOString().slice(0, 10),
      observacao: observacao ?? null
    });

    const savedMov = await manager.save(movimentacao);

    for (const item of items) {
      const epi = epis.find((row) => row.id === item.epiId)!;
      epi.estoqueAtual = epi.estoqueAtual + item.quantidade;
      await manager.save(epi);

      const movItem = manager.create(MovimentacaoItemEntity, {
        movimentacaoId: savedMov.id,
        epiId: item.epiId,
        quantidade: item.quantidade,
        dataVencimento: null
      });

      await manager.save(movItem);
    }

    return { id: savedMov.id };
  });
}

export async function listMovimentacoesRecentes(
  authUser: AuthUser,
  limite = 8
): Promise<MovimentacaoRecente[]> {
  const limiteSeguro = Math.min(Math.max(limite, 1), 50);
  const whereRole = authUser.role === "almoxarife" ? "WHERE m.usuario_id = $2" : "";
  const params = authUser.role === "almoxarife" ? [limiteSeguro, authUser.id] : [limiteSeguro];

  const rows = await AppDataSource.query(
    `
      SELECT
        m.id,
        m.tipo,
        m.data_movimentacao,
        m.observacao,
        m.usuario_id,
        u.nome AS usuario_nome,
        m.colaborador_id,
        c.nome AS colaborador_nome,
        COUNT(mi.id)::int AS total_itens,
        COALESCE(SUM(mi.quantidade), 0)::int AS total_quantidade
      FROM movimentacoes m
      INNER JOIN users u ON u.id = m.usuario_id
      LEFT JOIN colaboradores c ON c.id = m.colaborador_id
      LEFT JOIN movimentacao_itens mi ON mi.movimentacao_id = m.id
      ${whereRole}
      GROUP BY m.id, u.nome, c.nome
      ORDER BY m.data_movimentacao DESC, m.id DESC
      LIMIT $1
    `,
    params
  );

  return rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    protocolo: `MOV-${getProtocolYear(row.data_movimentacao)}-${String(row.id).padStart(6, "0")}`,
    tipo: String(row.tipo) as "entrega" | "entrada_saldo",
    dataMovimentacao: String(row.data_movimentacao),
    observacao: row.observacao ? String(row.observacao) : null,
    usuarioId: Number(row.usuario_id),
    usuarioNome: String(row.usuario_nome),
    colaboradorId: row.colaborador_id ? Number(row.colaborador_id) : null,
    colaboradorNome: row.colaborador_nome ? String(row.colaborador_nome) : null,
    totalItens: Number(row.total_itens),
    totalQuantidade: Number(row.total_quantidade)
  }));
}
