import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardData, DashboardService, StatCard } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  stats: StatCard[] = [];
  conformidadeGeral = 0;
  alertasVencimento: DashboardData['alertasVencimento'] = [];
  totalEpis = 0;
  totalEntregasMes = 0;
  loading = true;
  error = '';
  emptyState = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.dashboardService.carregarDashboard().subscribe({
      next: (data) => {
        this.applyDashboardData(data);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível carregar os dados reais do dashboard. Tente novamente.';
        this.cdr.markForCheck();
      },
    });
  }

  trackByAlertId(_: number, alerta: DashboardData['alertasVencimento'][number]): number {
    return alerta.id;
  }

  private applyDashboardData(data: DashboardData): void {
    this.stats = data.stats;
    this.conformidadeGeral = data.conformidadeGeral;
    this.alertasVencimento = data.alertasVencimento;
    this.totalEpis = data.totalEpis;
    this.totalEntregasMes = data.totalEntregasMes;
    this.emptyState = this.alertasVencimento.length === 0 && this.totalEntregasMes === 0;
  }
}