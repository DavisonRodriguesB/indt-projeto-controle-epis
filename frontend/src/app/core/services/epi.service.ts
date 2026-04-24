import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Epi {
  id: number;
  nome: string;
  codigo: string;
  ca: string;
  categoria: string;      
  categoria_id: number; 
  vida_util_dias: number;
  ativo: boolean;
  pode_editar: boolean;    
  validade: string;
  estoque_atual: number;
  estoque_minimo: number;
  created_at: string;
  updated_at: string;
}

export interface EpiPayload {
  nome: string;
  ca: string;
  validade: string;
  estoqueAtual: number; 
  estoqueMinimo: number;
  codigo?: string;
  categoriaId: number;
  vidaUtilDias: number;
  ativo?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number; };
}

@Injectable({ providedIn: 'root' })
export class EpiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/epis`;

  listar(page: number = 1, pageSize: number = 10): Observable<ApiResponse<Epi[]>> {
    return this.http.get<ApiResponse<Epi[]>>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`);
  }

  buscarPorId(id: number): Observable<ApiResponse<Epi>> {
    return this.http.get<ApiResponse<Epi>>(`${this.baseUrl}/${id}`);
  }

  salvar(payload: EpiPayload): Observable<ApiResponse<Epi>> {
    return this.http.post<ApiResponse<Epi>>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: EpiPayload): Observable<ApiResponse<Epi>> {
    return this.http.put<ApiResponse<Epi>>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}