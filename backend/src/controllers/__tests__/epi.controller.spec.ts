const listEpisMock = jest.fn();
const getEpiByIdMock = jest.fn();
const createEpiMock = jest.fn();
const updateEpiMock = jest.fn();
const deleteEpiMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.mock("../../services/epi.service", () => ({
  listEpis: (...args: unknown[]) => listEpisMock(...args),
  getEpiById: (...args: unknown[]) => getEpiByIdMock(...args),
  createEpi: (...args: unknown[]) => createEpiMock(...args),
  updateEpi: (...args: unknown[]) => updateEpiMock(...args),
  deleteEpi: (...args: unknown[]) => deleteEpiMock(...args)
}));

jest.mock("../../utiils/http-response", () => ({
  sendSuccess: (...args: unknown[]) => sendSuccessMock(...args)
}));

import { Request, Response } from "express";
import { handleCreateEpi, handleDeleteEpi, handleGetEpiById, handleListEpis, handleUpdateEpi } from "../epi.controller";

describe("epi controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list epis with meta total", async () => {
    listEpisMock.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await handleListEpis({} as Request, {} as Response);

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, [{ id: 1 }, { id: 2 }], { total: 2 });
  });

  it("should throw EPI_NOT_FOUND when epi does not exist", async () => {
    getEpiByIdMock.mockResolvedValue(null);

    await expect(handleGetEpiById({ params: { id: "10" } } as unknown as Request, {} as Response)).rejects.toMatchObject({
      code: "EPI_NOT_FOUND"
    });
  });

  it("should create epi and return 201", async () => {
    createEpiMock.mockResolvedValue({ id: 1 });

    await handleCreateEpi(
      {
        body: {
          nome: "Capacete",
          ca: "123",
          validade: "2027-12-31",
          estoqueAtual: 10,
          estoqueMinimo: 2
        }
      } as Request,
      {} as Response
    );

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 201, { id: 1 });
  });

  it("should update epi and return 200", async () => {
    updateEpiMock.mockResolvedValue({ id: 3, nome: "Oculos" });

    await handleUpdateEpi(
      {
        params: { id: "3" },
        body: {
          nome: "Oculos",
          ca: "999",
          validade: "2028-12-31",
          estoqueAtual: 11,
          estoqueMinimo: 3
        }
      } as unknown as Request,
      {} as Response
    );

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, { id: 3, nome: "Oculos" });
  });

  it("should return deleted=true when delete succeeds", async () => {
    deleteEpiMock.mockResolvedValue(true);

    await handleDeleteEpi({ params: { id: "2" } } as unknown as Request, {} as Response);

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, { deleted: true });
  });
});
