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
  matricula?: string;
}

export interface DashboardData {
  stats: StatCard[];
  conformidadeGeral: number;
  alertasVencimento: DashboardEpiAlert[];
  totalEpis: number;
  totalEntregasMes: number;
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
        const episResponse = epis as any;
        const totalEpis = episResponse.meta?.total ?? episResponse.data?.length ?? 0;

        const alertasVencimento = this.enriqueceAlertas(alertas.validade, entregasMes).slice(0, 10);
        
        const totalEntregasMes = entregasMes.length;
        const conformidadeGeral = this.calcularConformidade(totalEpis, alertas.validade, alertas.estoqueMinimo);

        return {
          stats: [
            {
              label: 'EPIs Vencidos',
              value: alertasVencimento.filter((a) => a.status === 'vencido').length,
              icon: 'ph-warning-octagon',
              color: 'text-red-500 bg-red-50 border-red-500',
              description: 'Uso expirado (Vida Útil)',
              trend: alertasVencimento.length > 0 ? 'Substituição necessária' : 'Em conformidade',
            },
            {
              label: 'Estoque Crítico',
              value: alertas.estoqueMinimo.length,
              icon: 'ph-package',
              color: 'text-amber-600 bg-amber-50 border-amber-500',
              description: 'EPIs abaixo do mínimo',
              trend: alertas.estoqueMinimo.length > 0 ? 'Repor prioridade' : 'Estoque saudável',
            },
            {
              label: 'Entregas / Mês',
              value: totalEntregasMes,
              icon: 'ph-check-square',
              color: 'text-blue-500 bg-blue-50 border-blue-500',
              description: 'Movimentações no período',
              trend: 'Dados reais do mês',
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

  private enriqueceAlertas(alertas: AlertaValidade[], entregasMes: any[]): DashboardEpiAlert[] {
    return alertas.map((alerta) => {
      const ultimaEntrega = entregasMes.find((entrega: any) =>
        entrega.itens?.some((item: any) => item.numero_ca === alerta.ca)
      );

      let equipamento = alerta.nome;
      let colaborador = '';
      let matricula = '';
      let dataVencimentoCalculada = new Date(alerta.validade);

      if (ultimaEntrega) {
        const itemEntrega = ultimaEntrega.itens?.find((item: any) => item.numero_ca === alerta.ca);
        
        if (itemEntrega) {
          equipamento = itemEntrega.nome;
          
          if (itemEntrega.vida_util_dias) {
            const dataEntrega = new Date(ultimaEntrega.data_movimentacao);
            dataEntrega.setDate(dataEntrega.getDate() + itemEntrega.vida_util_dias);
            dataVencimentoCalculada = dataEntrega;
          }
        }
        colaborador = ultimaEntrega.colaborador || '';
        matricula = ultimaEntrega.matricula || '';
      }

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const diffTime = dataVencimentoCalculada.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: alerta.id,
        nome: alerta.nome,
        ca: alerta.ca,
        validade: dataVencimentoCalculada,
        status: diasRestantes <= 0 ? 'vencido' : (diasRestantes <= 7 ? 'vence_em_breve' : 'vence_em_breve'), 
        diasParaVencer: diasRestantes,
        colaborador,
        equipamento,
        matricula,
      };
    });
  }

  private currentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      dataInicio: this.formatDateOnly(start),
      dataFim: this.formatDateOnly(end),
    };
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calcularConformidade(totalEpis: number, validade: AlertaValidade[], estoque: AlertaEstoque[]): number {
    if (totalEpis <= 0) return 100;
    const alertasUnicos = new Set([...validade.map(v => v.id), ...estoque.map(e => e.id)]);
    const percentual = ((totalEpis - alertasUnicos.size) / totalEpis) * 100;
    return Math.max(0, Math.min(100, Math.round(percentual)));
  }
}