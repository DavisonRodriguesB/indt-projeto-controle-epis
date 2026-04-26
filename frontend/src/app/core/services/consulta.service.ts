import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { EntregaCompleta, EntregaItem } from '../models/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly API = `${environment.apiUrl}/consultas/entregas`;

  constructor(private http: HttpClient) {}
  buscarSugestoesColaboradores(termo: string): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/colaboradores`).pipe(
      map(res => {
        const lista: any[] = res.data || [];
        const t = termo.toLowerCase();
        return lista.filter(
          (c: any) =>
            c.nome?.toLowerCase().includes(t) ||
            c.matricula?.toLowerCase().includes(t)
        );
      })
    );
  }

  buscarEntregas(filtros: any): Observable<EntregaCompleta[]> {
    if (!filtros) return new Observable(obs => { obs.next([]); obs.complete(); });

    let params = new HttpParams();
    if (filtros.colaborador_id) {
      params = params.set('colaborador_id', filtros.colaborador_id);
    }
    if (filtros.dataInicio) {
      params = params.set('data_inicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('data_fim', filtros.dataFim);
    }
    if (filtros.ca) {
      params = params.set('ca', filtros.ca);
    }

    return this.http.get<any>(this.API, { params }).pipe(
      map(res => this.normalizar(res.data || []))
    );
  }

  private normalizar(rows: any[]): EntregaCompleta[] {
    return rows.map(row => {
      const itens: EntregaItem[] = (row.itens || []).map((item: any, idx: number) => ({
        id:              idx + 1,
        nome:            item.nome            || 'EPI não identificado',
        quantidade:      item.quantidade      ?? 0,
        numero_ca:       item.numero_ca       || 'S/CA',
        codigo_material: item.codigo_material || 'N/A'
      }));

      const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

      return {
        id:              row.id?.toString() ?? '',
        colaborador:     row.colaborador_nome      || 'Não Identificado',
        matricula:       row.colaborador_matricula || 'N/A',
        setor:           row.setor_nome            || 'Geral',
        cargo:           row.cargo_nome            || 'Não Informado',
        data_hora:       row.data_hora             || '',
        usuario_emissor: row.usuario_emissor        || 'Sistema',
        total_itens:     totalItens,
        itens
      } as EntregaCompleta;
    });
  }
}