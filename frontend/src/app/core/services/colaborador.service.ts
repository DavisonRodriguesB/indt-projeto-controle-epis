import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';


export interface CargoResumo {
  id: number;
  descricao: string;
}

export interface SetorResumo {
  id: number;
  descricao: string;
}


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
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}


@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/colaboradores`;

  listar(): Observable<ApiResponse<Colaborador[]>> {
    return this.http.get<ApiResponse<Colaborador[]>>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<ApiResponse<Colaborador>> {
    return this.http.get<ApiResponse<Colaborador>>(`${this.baseUrl}/${id}`);
  }

  salvar(payload: ColaboradorPayload): Observable<ApiResponse<Colaborador>> {
    return this.http.post<ApiResponse<Colaborador>>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: ColaboradorPayload): Observable<ApiResponse<Colaborador>> {
    return this.http.put<ApiResponse<Colaborador>>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUrl}/${id}`);
  }
}