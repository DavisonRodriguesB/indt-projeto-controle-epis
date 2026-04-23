import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface CategoriaResumo {
  id: number;
  descricao: string;
}

export interface Epi {
  id: number;
  nome: string;
  codigo: string;
  ca: string;
  categoria_id: number; 
  categoria?: CategoriaResumo;
  vida_util_dias: number;
  ativo: boolean;
  validade: string;
  estoque_atual: number;
  estoque_minimo: number;
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

  listar(): Observable<ApiResponse<Epi[]>> {
    return this.http.get<ApiResponse<Epi[]>>(this.baseUrl);
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
}