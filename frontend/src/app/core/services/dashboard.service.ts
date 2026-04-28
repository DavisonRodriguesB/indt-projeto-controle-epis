import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { AlertasService, AlertaValidade, AlertaEstoque } from './alertas.service';
import { ConsultaService } from './consulta.service';
import { EpiService } from './epi.service';

export interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  description: string;
  trend?: string;
}

export interface DashboardEpiAlert {
  id: number;
  nome: string;
  ca: string;
  validade: Date;
  status: 'vencido' | 'vence_em_breve';
  diasParaVencer: number;
  colaborador?: string;
  equipamento?: string;
}

export interface DashboardData {
  stats: StatCard[];
  conformidadeGeral: number;
  alertasVencimento: DashboardEpiAlert[];
  totalEpis: number;
  totalEntregasMes: number;
}

interface EpiListResponse {
  data: unknown[];
  meta?: { total?: number };
}

interface EntregaFiltro {
  dataInicio: string;
  dataFim: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly alertasService = inject(AlertasService);
  private readonly epiService = inject(EpiService);
  private readonly consultaService = inject(ConsultaService);

  carregarDashboard(): Observable<DashboardData> {
    const { dataInicio, dataFim } = this.currentMonthRange();

    return forkJoin({
      alertas: this.alertasService.listarAlertas(),
      epis: this.epiService.listar(1, 1),
      entregasMes: this.consultaService.buscarEntregas({ dataInicio, dataFim }),
    }).pipe(
      map(({ alertas, epis, entregasMes }) => {
        const episResponse = epis as EpiListResponse;
        const totalEpis = episResponse.meta?.total ?? episResponse.data?.length ?? 0;
        const alertasVencimento = this.enriqueceAlertas(alertas.validade, entregasMes).slice(0, 10);
        const totalEntregasMes = entregasMes.length;
        const conformidadeGeral = this.calcularConformidade(totalEpis, alertas.validade, alertas.estoqueMinimo);

        return {
          stats: [
            {
              label: 'EPIs Vencidos',
              value: alertas.validade.filter((alerta) => alerta.status === 'vencido').length,
              icon: 'ph-warning-octagon',
              color: 'text-red-600 bg-red-50 border-red-500',
              description: 'Itens fora da validade e que exigem ação imediata',
              trend: alertas.validade.length > 0 ? 'Revisar inventário' : 'Sem vencimentos no período',
            },
            {
              label: 'Estoque Crítico',
              value: alertas.estoqueMinimo.length,
              icon: 'ph-package',
              color: 'text-amber-600 bg-amber-50 border-amber-500',
              description: 'EPIs abaixo do mínimo configurado',
              trend: alertas.estoqueMinimo.length > 0 ? 'Repor prioridade' : 'Estoque saudável',
            },
            {
              label: 'Entregas / Mês',
              value: totalEntregasMes,
              icon: 'ph-check-square',
              color: 'text-blue-600 bg-blue-50 border-blue-500',
              description: 'Entregas realizadas no mês atual',
              trend: totalEntregasMes > 0 ? 'Dados reais do período' : 'Sem entregas neste mês',
            },
          ],
          conformidadeGeral,
          alertasVencimento,
          totalEpis,
          totalEntregasMes,
        };
      }),
    );
  }

  private currentMonthRange(): EntregaFiltro {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      dataInicio: this.formatDateOnly(start),
      dataFim: this.formatDateOnly(end),
    };
  }

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private enriqueceAlertas(alertas: AlertaValidade[], entregasMes: any[]): DashboardEpiAlert[] {
    return alertas.map((alerta) => {
      // Procura a entrega mais recente deste EPI para pegar o colaborador
      const ultimaEntrega = entregasMes.find((entrega: any) =>
        entrega.itens?.some((item: any) => item.numero_ca === alerta.ca)
      );

      let equipamento = alerta.nome;
      let colaborador = '';

      if (ultimaEntrega) {
        const itemEntrega = ultimaEntrega.itens?.find((item: any) => item.numero_ca === alerta.ca);
        if (itemEntrega) {
          equipamento = itemEntrega.nome;
        }
        colaborador = ultimaEntrega.colaborador || '';
      }

      return {
        id: alerta.id,
        nome: alerta.nome,
        ca: alerta.ca,
        validade: new Date(alerta.validade),
        status: alerta.status,
        diasParaVencer: alerta.diasParaVencer,
        colaborador,
        equipamento,
      };
    });
  }

  private calcularConformidade(
    totalEpis: number,
    validade: AlertaValidade[],
    estoqueMinimo: AlertaEstoque[],
  ): number {
    if (totalEpis <= 0) {
      return 100;
    }

    const episEmAlerta = new Set<number>();

    for (const item of validade) {
      episEmAlerta.add(item.id);
    }

    for (const item of estoqueMinimo) {
      episEmAlerta.add(item.id);
    }

    const percentual = ((totalEpis - episEmAlerta.size) / totalEpis) * 100;
    return Math.max(0, Math.min(100, Math.round(percentual)));
  }
}