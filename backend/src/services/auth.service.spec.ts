import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
const repositoryMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

jest.mock("../database/data-source", () => ({
  AppDataSource: {
    getRepository: () => repositoryMock
  }
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

import { login, registerUser } from "./auth.service";

describe("auth service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw AUTH_INVALID_CREDENTIALS when user is not found", async () => {
    repositoryMock.findOne.mockResolvedValue(null);

    await expect(login("invalido@teste.com", "123456")).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS"
    });
  });

  it("should return token and user when login succeeds", async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 1,
      nome: "Admin",
      email: "admin@teste.com",
      senhaHash: "hash",
      role: "admin"
    });

    (compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.MockedFunction<typeof jwt.sign>).mockReturnValue("jwt-token" as never);

    const result = await login("admin@teste.com", "123456");

    expect(result).toEqual({
      token: "jwt-token",
      user: {
        id: 1,
        nome: "Admin",
        email: "admin@teste.com",
        role: "admin"
      }
    });
  });

  it("should throw AUTH_EMAIL_ALREADY_EXISTS when email is already in use", async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 3 });

    await expect(
      registerUser({
        nome: "Novo",
        email: "admin@teste.com",
        senha: "123456",
        role: "almoxarife"
      })
    ).rejects.toMatchObject({ code: "AUTH_EMAIL_ALREADY_EXISTS" });
  });

  it("should create and return user when register succeeds", async () => {
    repositoryMock.findOne.mockResolvedValue(null);
    (hash as jest.MockedFunction<typeof hash>).mockResolvedValue("hashed" as never);
    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue({
      id: 10,
      nome: "Usuario",
      email: "usuario@teste.com",
      role: "almoxarife"
    });

    const result = await registerUser({
      nome: "Usuario",
      email: "usuario@teste.com",
      senha: "123456",
      role: "almoxarife"
    });

    expect(result).toEqual({
      id: 10,
      nome: "Usuario",
      email: "usuario@teste.com",
      role: "almoxarife"
    });
  });
});
