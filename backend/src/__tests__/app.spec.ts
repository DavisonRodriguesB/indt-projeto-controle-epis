import request from "supertest";
import { app } from "../app";
import { login } from "../services/auth.service";

jest.mock("../services/auth.service", () => ({
  login: jest.fn(),
  registerUser: jest.fn()
}));

describe("app integration", () => {
  const loginMock = login as jest.MockedFunction<typeof login>;

  beforeEach(() => {
    loginMock.mockReset();
  });

  it("should return health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
  });

  it("should return 404 with ROUTE_NOT_FOUND for unknown route", async () => {
    const response = await request(app).get("/rota-que-nao-existe");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROUTE_NOT_FOUND");
  });

  it("should return AUTH_TOKEN_MISSING for protected route without token", async () => {
    const response = await request(app).get("/api/epis");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTH_TOKEN_MISSING");
  });

  it("should return VALIDATION_ERROR for invalid login payload", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "invalido", senha: "123" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("should return login payload from mocked service", async () => {
    loginMock.mockResolvedValue({
      token: "token-mock",
      user: {
        id: 1,
        nome: "Admin Mock",
        email: "admin.mock@controle-epis.local",
        role: "admin"
      }
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin.mock@controle-epis.local", senha: "admin123" });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBe("token-mock");
    expect(response.body.data.user.email).toBe("admin.mock@controle-epis.local");
    expect(loginMock).toHaveBeenCalledWith("admin.mock@controle-epis.local", "admin123");
  });
});
