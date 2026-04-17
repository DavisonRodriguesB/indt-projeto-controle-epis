export enum Perfil {
  ADMIN = 'admin',
  ALMOXARIFE = 'almoxarife',
  COLABORADOR = 'colaborador'
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  setor_id?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}