const transactionMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    transaction: (...args: unknown[]) => transactionMock(...args)
  }
}));

import { createEntradaSaldoMovimentacao, createEntregaMovimentacao } from "../movimentacao.service";

describe("movimentacao service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw MOVIMENTACAO_DUPLICATE_EPI on duplicated epi for entrega", async () => {
    await expect(
      createEntregaMovimentacao(
        1,
        [
          { epiId: 10, quantidade: 1 },
          { epiId: 10, quantidade: 2 }
        ],
        1
      )
    ).rejects.toMatchObject({ code: "MOVIMENTACAO_DUPLICATE_EPI" });

    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("should throw MOVIMENTACAO_DUPLICATE_EPI on duplicated epi for entrada", async () => {
    await expect(
      createEntradaSaldoMovimentacao(
        [
          { epiId: 10, quantidade: 1 },
          { epiId: 10, quantidade: 2 }
        ],
        1
      )
    ).rejects.toMatchObject({ code: "MOVIMENTACAO_DUPLICATE_EPI" });

    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("should throw COLABORADOR_NOT_FOUND when entrega collaborator does not exist", async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    await expect(
      createEntregaMovimentacao(1, [{ epiId: 10, quantidade: 1 }], 1)
    ).rejects.toMatchObject({ code: "COLABORADOR_NOT_FOUND" });
  });

  it("should throw AUTH_REQUIRED when entrada user does not exist", async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    await expect(
      createEntradaSaldoMovimentacao([{ epiId: 10, quantidade: 1 }], 5)
    ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
  });

  it("should create entrega movimentacao and update stock", async () => {
    const epi = { id: 10, ativo: true, estoqueAtual: 9, vidaUtilDias: 30 };

    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ id: 1, status: true })
        .mockResolvedValueOnce({ id: 99 }),
      find: jest.fn().mockResolvedValue([epi]),
      create: jest.fn().mockImplementation((_entity, payload) => ({ ...payload })),
      save: jest.fn().mockImplementation(async (entity) => {
        if (entity.tipo === "entrega") {
          return { ...entity, id: 555 };
        }
        return entity;
      })
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    const result = await createEntregaMovimentacao(
      1,
      [{ epiId: 10, quantidade: 4 }],
      99,
      "2026-04-07",
      "entrega"
    );

    expect(result).toEqual({ id: 555 });
    expect(epi.estoqueAtual).toBe(5);
    expect(manager.save).toHaveBeenCalled();
  });

  it("should create entrada saldo movimentacao and increase stock", async () => {
    const epi = { id: 10, ativo: true, estoqueAtual: 9, vidaUtilDias: 30 };

    const manager = {
      findOne: jest.fn().mockResolvedValueOnce({ id: 77 }),
      find: jest.fn().mockResolvedValue([epi]),
      create: jest.fn().mockImplementation((_entity, payload) => ({ ...payload })),
      save: jest.fn().mockImplementation(async (entity) => {
        if (entity.tipo === "entrada_saldo") {
          return { ...entity, id: 777 };
        }
        return entity;
      })
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    const result = await createEntradaSaldoMovimentacao(
      [{ epiId: 10, quantidade: 3 }],
      77,
      "2026-04-07",
      "entrada"
    );

    expect(result).toEqual({ id: 777 });
    expect(epi.estoqueAtual).toBe(12);
    expect(manager.save).toHaveBeenCalled();
  });
});
