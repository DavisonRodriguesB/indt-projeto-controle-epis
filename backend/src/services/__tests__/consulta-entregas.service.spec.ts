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
      matricula: "MAT-10",
      epiId: 20,
      ca: "CA-20",
      usuarioId: 30,
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07",
      mes: "2026-04"
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.colaborador_id = :colaboradorId", { colaboradorId: 10 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("c.matricula = :matricula", { matricula: "MAT-10" });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("mi.epi_id = :epiId", { epiId: 20 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("e.ca = :ca", { ca: "CA-20" });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.usuario_id = :usuarioId", { usuarioId: 30 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("m.data_movimentacao BETWEEN :dataInicio AND :dataFim", {
      dataInicio: "2026-04-01",
      dataFim: "2026-04-07"
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("to_char(m.data_movimentacao, 'YYYY-MM') = :mes", {
      mes: "2026-04"
    });
  });
});
