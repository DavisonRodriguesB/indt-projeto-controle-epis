const getRepositoryMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    getRepository: (...args: unknown[]) => getRepositoryMock(...args)
  }
}));

import { consultaEntregas } from "../consulta-entregas.service";

describe("consulta-entregas service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build base query and return rows without filters", async () => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ movimentacao_id: 1 }])
    };

    getRepositoryMock.mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    });

    const result = await consultaEntregas({});

    expect(queryBuilder.where).toHaveBeenCalledWith("m.tipo = :tipo", { tipo: "entrega" });
    expect(queryBuilder.getRawMany).toHaveBeenCalled();
    expect(result).toEqual([{ movimentacao_id: 1 }]);
  });

  it("should apply all supported filters", async () => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([])
    };

    getRepositoryMock.mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    });

    await consultaEntregas({
      colaboradorId: 10,
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07",
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.colaborador_id = :colaboradorId", { colaboradorId: 10 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.data_movimentacao BETWEEN :dataInicio AND :dataFim", {
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07"
    });
  });

  it("should group by and add group by", async () => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([])
    };

    getRepositoryMock.mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    });

    await consultaEntregas({
      colaboradorId: 10,
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07",
      groupBy: "m.colaborador_id",
      addGroupBy: "m.matricula"
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.colaborador_id = :colaboradorId", { colaboradorId: 10 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.data_movimentacao BETWEEN :dataInicio AND :dataFim", {
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07"
    });
    expect(queryBuilder.groupBy).toHaveBeenCalledWith("m.id");
    expect(queryBuilder.addGroupBy).toHaveBeenCalledWith("c.nome");
    expect(queryBuilder.addGroupBy).toHaveBeenCalledWith("c.matricula");
    expect(queryBuilder.addGroupBy).toHaveBeenCalledWith("s.descricao");
    expect(queryBuilder.addGroupBy).toHaveBeenCalledWith("cg.descricao");
    expect(queryBuilder.addGroupBy).toHaveBeenCalledWith("u.nome");
  });
});
