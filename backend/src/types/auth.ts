export type UserRole = "admin" | "almoxarife";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  nome: string;
  email: string;
  iat?: number;
  exp?: number;
}
