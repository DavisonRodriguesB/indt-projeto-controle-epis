const loginMock = jest.fn();
const registerUserMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.mock("../services/auth.service", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  registerUser: (...args: unknown[]) => registerUserMock(...args)
}));

jest.mock("../utiils/http-response", () => ({
  sendSuccess: (...args: unknown[]) => sendSuccessMock(...args)
}));

import { Request, Response } from "express";
import { handleLogin, handleMe, handleRegisterUser } from "./auth.controller";

describe("auth controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login and return success payload", async () => {
    loginMock.mockResolvedValue({ token: "jwt", user: { id: 1 } });

    await handleLogin(
      { body: { email: "admin@teste.com", senha: "123456" } } as Request,
      {} as Response
    );

    expect(loginMock).toHaveBeenCalledWith("admin@teste.com", "123456");
    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, {
      token: "jwt",
      user: { id: 1 }
    });
  });

  it("should register user and return 201", async () => {
    registerUserMock.mockResolvedValue({ id: 10, role: "almoxarife" });

    await handleRegisterUser(
      {
        body: {
          nome: "Usuario",
          email: "u@teste.com",
          senha: "123456",
          role: "almoxarife"
        }
      } as Request,
      {} as Response
    );

    expect(registerUserMock).toHaveBeenCalled();
    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 201, { id: 10, role: "almoxarife" });
  });

  it("should return current auth user on /me", async () => {
    await handleMe(
      { authUser: { id: 1, nome: "Admin", email: "a@t.com", role: "admin" } } as Request,
      {} as Response
    );

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, {
      id: 1,
      nome: "Admin",
      email: "a@t.com",
      role: "admin"
    });
  });
});
