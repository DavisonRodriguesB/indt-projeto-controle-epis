import { AppDataSource } from "../database/data-source";

interface ConsultaFiltros {
  colaboradorId?: number;
  matricula?: string;
  epiId?: number;
  ca?: string;
  dataInicio?: string;
  dataFim?: string;
  mes?: string;
  usuarioId?: number;
}

export async function consultaEntregas(filtros: ConsultaFiltros): Promise<Record<string, unknown>[]> {
  const query = AppDataSource
    .getRepository("movimentacoes")
    .createQueryBuilder("m")
    .innerJoin("movimentacao_itens", "mi", "mi.movimentacao_id = m.id")
    .innerJoin("epis", "e", "e.id = mi.epi_id")
    .leftJoin("colaboradores", "c", "c.id = m.colaborador_id")
    .innerJoin("users", "u", "u.id = m.usuario_id")
    .where("m.tipo = :tipo", { tipo: "entrega" })
    .orderBy("m.data_movimentacao", "DESC")
    .addOrderBy("m.id", "DESC")
    .select([
      "m.id as movimentacao_id",
      "m.data_movimentacao as data_movimentacao",
      "m.observacao as observacao",
      "m.usuario_id as usuario_id",
      "u.nome as usuario_nome",
      "c.id as colaborador_id",
      "c.nome as colaborador_nome",
      "c.matricula as colaborador_matricula",
      "mi.id as item_id",
      "mi.epi_id as epi_id",
      "e.nome as epi_nome",
      "e.ca as epi_ca",
      "mi.quantidade as quantidade",
      "mi.data_vencimento as data_vencimento"
    ]);

  if (filtros.colaboradorId) {
    query.andWhere("m.colaborador_id = :colaboradorId", { colaboradorId: filtros.colaboradorId });
  }

  if (filtros.matricula) {
    query.andWhere("c.matricula = :matricula", { matricula: filtros.matricula });
  }

  if (filtros.epiId) {
    query.andWhere("mi.epi_id = :epiId", { epiId: filtros.epiId });
  }

  if (filtros.ca) {
    query.andWhere("e.ca = :ca", { ca: filtros.ca });
  }

  if (filtros.usuarioId) {
    query.andWhere("m.usuario_id = :usuarioId", { usuarioId: filtros.usuarioId });
  }

  if (filtros.dataInicio && filtros.dataFim) {
    query.andWhere("m.data_movimentacao BETWEEN :dataInicio AND :dataFim", {
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim
    });
  }

  if (filtros.mes) {
    query.andWhere("to_char(m.data_movimentacao, 'YYYY-MM') = :mes", { mes: filtros.mes });
  }

  return query.getRawMany();
}
