import { AppDataSource } from "../database/data-source";

export async function consultaEntregas(filtros: any): Promise<any[]> {
  
  const query = AppDataSource
    .getRepository("movimentacoes")
    .createQueryBuilder("m")
    .innerJoin("movimentacao_itens", "mi", "mi.movimentacao_id = m.id")
    .innerJoin("epis", "e", "e.id = mi.epi_id")
    .leftJoin("colaboradores", "c", "c.id = m.colaborador_id")
    .leftJoin("setores", "s", "s.id = c.setor_id")   
    .leftJoin("cargos", "cg", "cg.id = c.cargo_id") 
    .innerJoin("users", "u", "u.id = m.usuario_id")
    .where("m.tipo = :tipo", { tipo: "entrega" });

  if (filtros.colaboradorId) query.andWhere("m.colaborador_id = :colaboradorId", { colaboradorId: filtros.colaboradorId });
  if (filtros.dataInicio && filtros.dataFim) {
    query.andWhere("m.data_movimentacao BETWEEN :dataInicio AND :dataFim", {
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim
    });
  }

  return query
    .select([
      "m.id AS id",
      "m.created_at AS data_hora",
      "m.observacao AS observacao",
      "c.nome AS colaborador_nome",
      "c.matricula AS colaborador_matricula",
      "s.descricao AS setor_nome", 
      "cg.descricao AS cargo_nome", 
      "u.nome AS usuario_emissor",
      `json_agg(
        json_build_object(
          'nome', e.nome,
          'numero_ca', e.ca,
          'quantidade', mi.quantidade,
          'codigo_material', e.codigo
        )
      ) AS itens`
    ])
    .groupBy("m.id")
    .addGroupBy("c.nome")
    .addGroupBy("c.matricula")
    .addGroupBy("s.descricao")
    .addGroupBy("cg.descricao")
    .addGroupBy("u.nome")
    .orderBy("m.data_movimentacao", "DESC")
    .getRawMany();
}