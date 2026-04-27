import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppDataSource } from "../database/data-source";
import { UserEntity } from "../entities/user.entity";
import { AppError } from "../middlewares/error-handler";
import { AuthUser, JwtPayload, UserRole } from "../types/auth";

const userRepository = AppDataSource.getRepository(UserEntity);

interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
}

interface UpdateUserInput {
  nome: string;
  email: string;
  role: UserRole;
  senha?: string;
}

interface LoginResult {
  token: string;
  user: AuthUser;
}

function mapToAuthUser(row: UserEntity): AuthUser {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    role: row.role
  };
}

export async function listUsers(): Promise<AuthUser[]> {
  const users = await userRepository.find({
    order: { nome: "ASC" }
  });

  return users.map(mapToAuthUser);
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<AuthUser> {
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new AppError(404, "Usuario nao encontrado.", "AUTH_USER_NOT_FOUND");
  }

  const existingWithEmail = await userRepository.findOne({ where: { email: input.email } });
  if (existingWithEmail && existingWithEmail.id !== id) {
    throw new AppError(409, "Ja existe usuario com este email.", "AUTH_EMAIL_ALREADY_EXISTS");
  }

  user.nome = input.nome;
  user.email = input.email;
  user.role = input.role;

  if (input.senha && input.senha.trim().length > 0) {
    user.senhaHash = await hash(input.senha, 10);
  }

  const saved = await userRepository.save(user);
  return mapToAuthUser(saved);
}

export async function login(email: string, senha: string): Promise<LoginResult> {
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    throw new AppError(401, "Email ou senha invalidos.", "AUTH_INVALID_CREDENTIALS");
  }

  const isPasswordValid = await compare(senha, user.senhaHash);

  if (!isPasswordValid) {
    throw new AppError(401, "Email ou senha invalidos.", "AUTH_INVALID_CREDENTIALS");
  }

  const authUser = mapToAuthUser(user);
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];
  const token = jwt.sign(
    {
      role: authUser.role,
      nome: authUser.nome,
      email: authUser.email
    },
    env.JWT_SECRET,
    {
      subject: String(authUser.id),
      expiresIn
    }
  );

  return {
    token,
    user: authUser
  };
}

export async function refreshSession(refreshToken: string): Promise<LoginResult> {
  if (!refreshToken) {
    throw new AppError(401, "Token invalido ou expirado.", "AUTH_TOKEN_INVALID");
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
  } catch (_error) {
    throw new AppError(401, "Token invalido ou expirado.", "AUTH_TOKEN_INVALID");
  }

  const userId = Number(payload.sub);

  if (!Number.isFinite(userId)) {
    throw new AppError(401, "Token invalido ou expirado.", "AUTH_TOKEN_INVALID");
  }

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError(401, "Token invalido ou expirado.", "AUTH_TOKEN_INVALID");
  }

  const authUser = mapToAuthUser(user);
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];
  const token = jwt.sign(
    {
      role: authUser.role,
      nome: authUser.nome,
      email: authUser.email
    },
    env.JWT_SECRET,
    {
      subject: String(authUser.id),
      expiresIn
    }
  );

  return {
    token,
    user: authUser
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await userRepository.findOne({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, "Ja existe usuario com este email.", "AUTH_EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hash(input.senha, 10);
  const entity = userRepository.create({
    nome: input.nome,
    email: input.email,
    senhaHash: passwordHash,
    role: input.role
  });

  const saved = await userRepository.save(entity);
  return mapToAuthUser(saved);
}