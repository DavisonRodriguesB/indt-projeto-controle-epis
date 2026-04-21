import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3333/api/cadastro';

  listar(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${endpoint}`);
  }

  salvar(endpoint: string, dados: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${endpoint}`, dados);
  }

  alterarStatus(endpoint: string, id: number, descricao: string, ativo: boolean): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${endpoint}/${id}`, { descricao, ativo });
  }
}