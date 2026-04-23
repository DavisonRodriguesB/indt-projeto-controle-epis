import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly API = `${environment.apiUrl}/consultas/entregas`;

  constructor(private http: HttpClient) {}

  buscarSugestoesColaboradores(termo: string): Observable<any[]> {
    const params = new HttpParams().set('search', termo);
    return this.http.get<any>(`${environment.apiUrl}/colaboradores/sugestoes`, { params }).pipe(
      map(res => res.data || res)
    );
  }

  buscarEntregas(filtros: any): Observable<any[]> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      if (valor !== '' && valor !== null && valor !== undefined) {
        params = params.append(key, valor);
      }
    });

    return this.http.get<any>(this.API, { params }).pipe(
      map(res => this.agruparEntregas(res.data || []))
    );
  }

  private agruparEntregas(dados: any[]): any[] {
    const mapa = new Map();
    dados.forEach(row => {
      if (!mapa.has(row.movimentacao_id)) {
        mapa.set(row.movimentacao_id, {
          id: row.movimentacao_id,
          colaborador: row.colaborador_nome,
          matricula: row.colaborador_matricula,
          data_hora: row.data_movimentacao,
          usuario_emissor: row.usuario_nome,
          itens: [],
          total_itens: 0
        });
      }
      const e = mapa.get(row.movimentacao_id);
      e.itens.push({ nome: row.epi_nome, quantidade: row.quantidade });
      e.total_itens += row.quantidade;
    });
    return Array.from(mapa.values());
  }
}