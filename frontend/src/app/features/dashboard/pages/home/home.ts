import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  description: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  
  // Dados simulados para os cards de estatísticas
  stats: StatCard[] = [
    { 
      label: 'EPIs Vencidos', 
      value: 12, 
      icon: 'ph-warning-octagon', 
      color: 'text-red-600 bg-red-50 border-red-500',
      description: 'Colaboradores com EPIs vencidos',
      trend: 'Ação imediata'
    },
    { 
      label: 'Estoque Crítico', 
      value: 5, 
      icon: 'ph-package', 
      color: 'text-amber-600 bg-amber-50 border-amber-500',
      description: 'Itens abaixo do mínimo'
    },
    { 
      label: 'Entregas / Mês', 
      value: 148, 
      icon: 'ph-check-square', 
      color: 'text-blue-600 bg-blue-50 border-blue-500',
      description: 'Entregas realizadas no mês atual',
    }
  ];

  conformidadeGeral = 92;

  alertasVencimento = [
    { colaborador: 'Carlos Silva', epi: 'Protetor Auricular Plug', data: new Date('2026-04-10'), status: 'critico' },
    { colaborador: 'Ana Souza', epi: 'Capacete Classe B', data: new Date('2026-04-15'), status: 'alerta' },
    { colaborador: 'Juliana Costa', epi: 'Bota de Segurança', data: new Date('2026-04-20'), status: 'normal' },
  ];

  ngOnInit(): void {
  
  }
}