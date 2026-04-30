import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { AlertasService, AlertaEstoque } from './alertas.service';
import { EpiService } from './epi.service';
import { ConsultaService } from './consulta.service';

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
  validade: Date;             // data_vencimento do movimentacao_item
  status: 'vencido' | 'vence_em_breve';
  diasParaVencer: number;
  colaborador: string;
  equipamento: string;
  matricula: string;
}

export interface DashboardData {
  stats: StatCard[];
  conformidadeGeral: number;
  alertasVencimento: DashboardEpiAlert[];  // todos os próximos (max 10 no modal)
  alertasHome: DashboardEpiAlert[];        // só os 5 mais urgentes para a tabela
  totalEpis: number;
  totalEntregasMes: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly alertasService = inject(AlertasService);
  private readonly epiService     = inject(EpiService);
  private readonly consultaService = inject(ConsultaService);

  carregarDashboard(): Observable<DashboardData> {
    const { dataInicio, dataFim } = this.currentMonthRange();

    return forkJoin({
      estoqueAlertas: this.alertasService.listarAlertas(),
      epis:           this.epiService.listar(),
      entregasMes:    this.consultaService.buscarEntregas({ data_inicio: dataInicio, data_fim: dataFim }),
      todasEntregas:  this.consultaService.buscarEntregas({}),
    }).pipe(
      map(({ estoqueAlertas, epis, entregasMes, todasEntregas }) => {
        const episResponse = epis as any;
        const totalEpis = episResponse.meta?.total ?? episResponse.data?.length ?? 0;
        const totalEntregasMes = entregasMes.length;
        const alertasBrutos = this.extrairAlertasDeEntregas(todasEntregas);

        // Filtra apenas os próximos 30 dias e vencidos, ordena por urgência
        const alertasFiltrados = alertasBrutos
          .filter(a => a.diasParaVencer <= 30)
          .sort((a, b) => a.diasParaVencer - b.diasParaVencer);

        const alertasVencimento = alertasFiltrados.slice(0, 10); // modal: max 10
        const alertasHome       = alertasFiltrados.slice(0, 5);  // tabela: max 5

        const conformidadeGeral = this.calcularConformidade(
          totalEpis,
          alertasBrutos.filter(a => a.status === 'vencido').length,
          estoqueAlertas.estoqueMinimo
        );

        return {
          stats: this.montarStats(alertasVencimento, estoqueAlertas.estoqueMinimo, totalEntregasMes),
          conformidadeGeral,
          alertasVencimento,
          alertasHome,
          totalEpis,
          totalEntregasMes,
        };
      })
    );
  }

  private extrairAlertasDeEntregas(entregas: any[]): DashboardEpiAlert[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const alertas: DashboardEpiAlert[] = [];
    let idSeq = 0;

    for (const entrega of entregas) {
      for (const item of (entrega.itens ?? [])) {
        const dataVencStr: string | null = item.data_vencimento ?? null;
        if (!dataVencStr) continue;

        const dataVenc = new Date(dataVencStr + 'T00:00:00');
        const diffDias = Math.floor((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        alertas.push({
          id:            ++idSeq,
          nome:          item.nome          ?? 'EPI não identificado',
          ca:            item.numero_ca     ?? 'S/CA',
          validade:      dataVenc,
          status:        diffDias < 0 ? 'vencido' : 'vence_em_breve',
          diasParaVencer: diffDias,
          colaborador:   entrega.colaborador ?? '',
          equipamento:   item.nome           ?? '',
          matricula:     entrega.matricula   ?? '',
        });
      }
    }

    return alertas;
  }

  private montarStats(
    alertasVencimento: DashboardEpiAlert[],
    estoqueMinimo: AlertaEstoque[],
    totalEntregasMes: number
  ): StatCard[] {
    return [
      {
        label:       'EPIs Vencidos',
        value:       alertasVencimento.filter(a => a.status === 'vencido').length,
        icon:        'ph-warning-octagon',
        color:       'text-red-500 bg-red-50 border-red-500',
        description: 'Vida útil expirada',
        trend:       alertasVencimento.some(a => a.status === 'vencido') ? 'Substituição necessária' : 'Em conformidade',
      },
      {
        label:       'Estoque Crítico',
        value:       estoqueMinimo.length,
        icon:        'ph-package',
        color:       'text-amber-600 bg-amber-50 border-amber-500',
        description: 'EPIs abaixo do mínimo',
        trend:       estoqueMinimo.length > 0 ? 'Repor prioridade' : 'Estoque saudável',
      },
      {
        label:       'Entregas / Mês',
        value:       totalEntregasMes,
        icon:        'ph-check-square',
        color:       'text-blue-500 bg-blue-50 border-blue-500',
        description: 'Movimentações no período',
        trend:       'Dados reais do mês',
      },
    ];
  }

  private currentMonthRange() {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      dataInicio: this.formatDateOnly(start),
      dataFim:    this.formatDateOnly(end),
    };
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calcularConformidade(
    totalEpis: number,
    totalVencidos: number,
    estoque: AlertaEstoque[]
  ): number {
    if (totalEpis <= 0) return 100;
    const problemáticos = new Set<number>();
    estoque.forEach(e => problemáticos.add(e.id));
    const totalProblemas = problemáticos.size + totalVencidos;
    const percentual = ((totalEpis - totalProblemas) / totalEpis) * 100;
    return Math.max(0, Math.min(100, Math.round(percentual)));
  }
}