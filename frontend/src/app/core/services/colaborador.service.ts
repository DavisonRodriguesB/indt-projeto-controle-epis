import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';


export interface CargoResumo  { id: number; descricao: string; }
export interface SetorResumo  { id: number; descricao: string; }

export interface Colaborador {
  id: number;
  nome: string;
  matricula: string;
  cargoId: number;
  setorId: number;
  cargo_id?: number;
  setor_id?: number;
  cargo?: CargoResumo;
  setor?: SetorResumo;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColaboradorPayload {
  nome: string;
  matricula: string;
  cargoId: number;
  setorId: number;
  status?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number; };
}

export interface EpiColaborador {
  movimentacao_item_id: number;
  movimentacao_id: number;
  epi_id: number;
  epi_nome: string;
  epi_ca: string;
  epi_codigo: string;
  quantidade: number;
  data_entrega: string;          
  data_vencimento: string | null; 
}

export type StatusValidade = 'valido' | 'proximo' | 'vencido';

export function calcularStatusValidade(dataVencimento: string | null): StatusValidade {
  if (!dataVencimento) return 'valido';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimento + 'T00:00:00');
  const diffDias = Math.floor((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias < 0)  return 'vencido';
  if (diffDias < 30) return 'proximo';
  return 'valido';
}


function normalizar(raw: any): Colaborador {
  return {
    id:        raw.id,
    nome:      raw.nome,
    matricula: raw.matricula,
    cargoId:   raw.cargoId  ?? raw.cargo_id  ?? raw.cargo?.id,
    setorId:   raw.setorId  ?? raw.setor_id  ?? raw.setor?.id,
    cargo_id:  raw.cargo_id ?? raw.cargoId,
    setor_id:  raw.setor_id ?? raw.setorId,
    cargo:     raw.cargo,
    setor:     raw.setor,
    status:    raw.status,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}


@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  private http    = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/colaboradores`;

  listar(): Observable<ApiResponse<Colaborador[]>> {
    return this.http.get<ApiResponse<any[]>>(this.baseUrl).pipe(
      map(res => ({ ...res, data: res.data.map(normalizar) }))
    );
  }

  buscarPorId(id: number): Observable<ApiResponse<Colaborador>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map(res => ({ ...res, data: normalizar(res.data) }))
    );
  }

  salvar(payload: ColaboradorPayload): Observable<ApiResponse<Colaborador>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, payload).pipe(
      map(res => ({ ...res, data: normalizar(res.data) }))
    );
  }

  atualizar(id: number, payload: any): Observable<ApiResponse<Colaborador>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, payload).pipe(
      map(res => ({ ...res, data: normalizar(res.data) }))
    );
  }

  excluir(id: number): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUrl}/${id}`);
  }


  buscarEpis(id: number): Observable<ApiResponse<EpiColaborador[]>> {
    return this.http.get<ApiResponse<EpiColaborador[]>>(`${this.baseUrl}/${id}/epis`);
  }
}