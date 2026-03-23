import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppDataSource } from "../database/data-source";
import { UserEntity } from "../entities/user.entity";
import { AppError } from "../middlewares/error-handler";
import { AuthUser, UserRole } from "../types/auth";

const userRepository = AppDataSource.getRepository(UserEntity);

interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
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
