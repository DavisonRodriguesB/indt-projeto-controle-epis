import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Colaborador {
  id: number;
  nome: string;
  matricula: string;
  cargo_id: number;
  setor_id: number;
  status: boolean;
  cargo?: { descricao: string }; 
  setor?: { descricao: string };
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { total?: number };
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

  salvar(payload: any): Observable<ApiResponse<Colaborador>> {
    return this.http.post<ApiResponse<Colaborador>>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: any): Observable<ApiResponse<Colaborador>> {
    return this.http.put<ApiResponse<Colaborador>>(`${this.baseUrl}/${id}`, payload);
  }
}