const colaboradorRepositoryMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

const cargoRepositoryMock = {
  findOne: jest.fn()
};

const setorRepositoryMock = {
  findOne: jest.fn()
};

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    getRepository: (target: { name?: string }) => {
      if (target?.name === "CargoEntity") {
        return cargoRepositoryMock;
      }

      if (target?.name === "SetorEntity") {
        return setorRepositoryMock;
      }

      return colaboradorRepositoryMock;
    }
  }
}));

import { createColaborador, deleteColaborador, listColaboradores, updateColaborador } from "../colaborador.service";

describe("colaborador service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list colaboradores mapped to API format", async () => {
    colaboradorRepositoryMock.find.mockResolvedValue([
      {
        id: 1,
        nome: "Joao",
        matricula: "M1",
        cargoId: 11,
        setorId: 12,
        status: true,
        setor: "Operacao",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z")
      }
    ]);

    const result = await listColaboradores();

    expect(result).toEqual([
      {
        id: 1,
        nome: "Joao",
        matricula: "M1",
        setor: "Operacao",
        cargo_id: 11,
        setor_id: 12,
        status: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z"
      }
    ]);
  });

  it("should throw when matricula already exists", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValue({ id: 10 });

    await expect(
      createColaborador({ nome: "Ana", matricula: "M2", setor: "RH" })
    ).rejects.toMatchObject({ code: "COLABORADOR_MATRICULA_ALREADY_EXISTS" });
  });

  it("should throw CARGO_NOT_FOUND when cargoId is provided and not found", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(
      createColaborador({ nome: "Ana", matricula: "M2", cargoId: 1, setorId: 2 })
    ).rejects.toMatchObject({ code: "CARGO_NOT_FOUND" });
  });

  it("should throw SETOR_NOT_FOUND when setorId is provided and not found", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce({ id: 1, ativo: true });
    setorRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(
      createColaborador({ nome: "Ana", matricula: "M2", cargoId: 1, setorId: 2 })
    ).rejects.toMatchObject({ code: "SETOR_NOT_FOUND" });
  });

  it("should create colaborador when matricula is new", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce({ id: 1, ativo: true });
    setorRepositoryMock.findOne.mockResolvedValueOnce({ id: 2, ativo: true });
    colaboradorRepositoryMock.create.mockImplementation((input) => input);
    colaboradorRepositoryMock.save.mockResolvedValue({
      id: 2,
      nome: "Ana",
      matricula: "M2",
      cargoId: 1,
      setorId: 2,
      status: true,
      setor: "RH",
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      updatedAt: new Date("2026-03-22T00:00:00.000Z")
    });

    const result = await createColaborador({ nome: "Ana", matricula: "M2", setor: "RH", cargoId: 1, setorId: 2 });

    expect(result.id).toBe(2);
    expect(result.matricula).toBe("M2");
  });

  it("should return null when update id does not exist", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(null);

    const result = await updateColaborador(99, {
      nome: "Ana",
      matricula: "M2"
    });

    expect(result).toBeNull();
  });

  it("should throw duplicate error on update when matricula belongs to another id", async () => {
    colaboradorRepositoryMock.findOne
      .mockResolvedValueOnce({
        id: 1,
        nome: "Atual",
        matricula: "M1",
        cargoId: 1,
        setorId: 1,
        status: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z")
      })
      .mockResolvedValueOnce({ id: 2, matricula: "M2" });

    await expect(
      updateColaborador(1, {
        nome: "Novo",
        matricula: "M2"
      })
    ).rejects.toMatchObject({ code: "COLABORADOR_MATRICULA_ALREADY_EXISTS" });
  });

  it("should throw CARGO_NOT_FOUND on update", async () => {
    colaboradorRepositoryMock.findOne
      .mockResolvedValueOnce({
        id: 1,
        nome: "Atual",
        matricula: "M1",
        cargoId: 1,
        setorId: 1,
        status: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z")
      })
      .mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(
      updateColaborador(1, {
        nome: "Novo",
        matricula: "M1",
        cargoId: 10,
        setorId: 20
      })
    ).rejects.toMatchObject({ code: "CARGO_NOT_FOUND" });
  });

  it("should throw SETOR_NOT_FOUND on update", async () => {
    colaboradorRepositoryMock.findOne
      .mockResolvedValueOnce({
        id: 1,
        nome: "Atual",
        matricula: "M1",
        cargoId: 1,
        setorId: 1,
        status: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z")
      })
      .mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce({ id: 10, ativo: true });
    setorRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(
      updateColaborador(1, {
        nome: "Novo",
        matricula: "M1",
        cargoId: 10,
        setorId: 20
      })
    ).rejects.toMatchObject({ code: "SETOR_NOT_FOUND" });
  });

  it("should update colaborador and map result", async () => {
    const existing = {
      id: 1,
      nome: "Atual",
      matricula: "M1",
      cargoId: 1,
      setorId: 1,
      status: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    };

    colaboradorRepositoryMock.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);
    cargoRepositoryMock.findOne.mockResolvedValueOnce({ id: 10, ativo: true });
    setorRepositoryMock.findOne.mockResolvedValueOnce({ id: 20, ativo: true });
    colaboradorRepositoryMock.save.mockResolvedValue({
      ...existing,
      nome: "Novo",
      matricula: "M10",
      cargoId: 10,
      setorId: 20,
      status: false,
      updatedAt: new Date("2026-02-01T00:00:00.000Z")
    });

    const result = await updateColaborador(1, {
      nome: "Novo",
      matricula: "M10",
      cargoId: 10,
      setorId: 20,
      status: false
    });

    expect(result).toEqual({
      id: 1,
      nome: "Novo",
      matricula: "M10",
      setor: undefined,
      cargo_id: 10,
      setor_id: 20,
      status: false,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-02-01T00:00:00.000Z"
    });
  });

  it("should return false when delete id does not exist", async () => {
    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(null);

    const deleted = await deleteColaborador(50);

    expect(deleted).toBe(false);
  });

  it("should set status false and return true when delete succeeds", async () => {
    const existing = {
      id: 1,
      nome: "Atual",
      matricula: "M1",
      cargoId: 1,
      setorId: 1,
      status: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z")
    };

    colaboradorRepositoryMock.findOne.mockResolvedValueOnce(existing);
    colaboradorRepositoryMock.save.mockResolvedValueOnce({ ...existing, status: false });

    const deleted = await deleteColaborador(1);

    expect(deleted).toBe(true);
    expect(existing.status).toBe(false);
    expect(colaboradorRepositoryMock.save).toHaveBeenCalled();
  });
});
