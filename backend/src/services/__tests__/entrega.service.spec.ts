const transactionMock = jest.fn();
const getRepositoryMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    transaction: (...args: unknown[]) => transactionMock(...args),
    getRepository: (...args: unknown[]) => getRepositoryMock(...args)
  }
}));

import { createEntrega, listEntregas } from "../entrega.service";

describe("entrega service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw COLABORADOR_NOT_FOUND when collaborator does not exist", async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      getRepository: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    await expect(
      createEntrega({ colaboradorId: 1, epiId: 1, quantidade: 1 }, 1)
    ).rejects.toMatchObject({ code: "COLABORADOR_NOT_FOUND" });
  });

  it("should throw EPI_INSUFFICIENT_STOCK when stock is lower than requested amount", async () => {
    const queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 7, estoqueAtual: 1 })
    };

    const manager = {
      findOne: jest.fn().mockResolvedValueOnce({ id: 1 }),
      getRepository: jest.fn().mockReturnValue({ createQueryBuilder: () => queryBuilder }),
      create: jest.fn(),
      save: jest.fn()
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    await expect(
      createEntrega({ colaboradorId: 1, epiId: 7, quantidade: 5 }, 1)
    ).rejects.toMatchObject({ code: "EPI_INSUFFICIENT_STOCK" });
  });

  it("should create entrega and decrement stock when data is valid", async () => {
    const epiEntity = { id: 7, estoqueAtual: 10 };
    const queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(epiEntity)
    };

    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 99, role: "admin" }),
      getRepository: jest.fn().mockReturnValue({ createQueryBuilder: () => queryBuilder }),
      create: jest.fn().mockReturnValue({ id: 123 }),
      save: jest.fn().mockResolvedValue(undefined)
    };

    transactionMock.mockImplementation(async (callback) => callback(manager));

    await createEntrega({ colaboradorId: 1, epiId: 7, quantidade: 4 }, 99);

    expect(manager.save).toHaveBeenCalledTimes(2);
    expect(epiEntity.estoqueAtual).toBe(6);
  });

  it("should map nested entrega relations on list", async () => {
    getRepositoryMock.mockReturnValue({
      find: jest.fn().mockResolvedValue([
        {
          id: 1,
          quantidade: 2,
          dataEntrega: "2026-03-22",
          observacao: "Entrega mensal",
          colaborador: {
            id: 10,
            nome: "Joao",
            matricula: "MAT1",
            setorId: 12,
            cargoId: 34,
            setor: { descricao: "Manutencao" },
            cargo: { descricao: "Almoxarifado" }
          },
          epi: { id: 4, nome: "Luva", ca: "123" },
          usuario: { id: 8, nome: "Admin", email: "admin@teste.com", role: "admin" }
        }
      ])
    });

    const result = await listEntregas();

    expect(result).toEqual([
      {
        id: 1,
        quantidade: 2,
        data_entrega: "2026-03-22",
        observacao: "Entrega mensal",
        colaborador: {
          id: 10,
          nome: "Joao",
          matricula: "MAT1",
          setor: "Manutencao",
          cargo: "Almoxarifado",
          setor_id: 12,
          cargo_id: 34
        },
        epi: { id: 4, nome: "Luva", ca: "123" },
        usuario: { id: 8, nome: "Admin", email: "admin@teste.com", role: "admin" }
      }
    ]);
  });
});
