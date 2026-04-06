import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FiltroConsultaComponent } from './components/filtro-consulta/filtro-consulta';
import { TabelaConsultaComponent } from './components/tabela-consulta/tabela-consulta';

import { RelatorioepiComponent } from '../../shared/components/relatorioepi/relatorioepi';
import { RelatorioEpiData } from '../../shared/components/relatorioepi/relatorio-epi.model';

@Component({
  selector: 'app-consulta-entregas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FiltroConsultaComponent, 
    TabelaConsultaComponent,
    RelatorioepiComponent 
  ],
  templateUrl: './consulta-entregas.html'
})
export class ConsultaEntregasComponent implements OnInit {
  
  listaEntregas: any[] = []; 
  entregaSelecionada: RelatorioEpiData | null = null;
  exibirModal = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  executarBusca(filtros: any) {
    
    this.listaEntregas = [];
    console.log('Consultando registros com filtros:', filtros);
    
    // Simulação de busca retornando dados no formato da RelatorioEpiData
    setTimeout(() => {
      this.listaEntregas = [
        {
          id: '2026001',
          colaborador: 'Bruce Wayne',
          matricula: '20234',
          setor: 'Desenvolvimento',
          cargo: 'Software Developer',
          data_hora: '05/04/2026 14:30',
          usuario_emissor: 'Admin Sistema',
          total_itens: 3,
          itens: [
            { nome: 'Luva de Vaqueta', numero_ca: '12345', quantidade: 1 },
            { nome: 'Capacete de Segurança', numero_ca: '98765', quantidade: 1 },
            { nome: 'Óculos de Proteção', numero_ca: '55443', quantidade: 1 }
          ]
        },
        {
          id: '2026002',
          colaborador: 'Tony Stark',
          matricula: '67890',
          setor: 'Produção',
          cargo: 'Operadora',
          data_hora: '06/04/2026 15:15',
          usuario_emissor: 'Portaria',
          total_itens: 1,
          itens: [
            { nome: 'Protetor Auricular', numero_ca: '11223', quantidade: 1 }
          ]
        }
      ];

      this.cdr.detectChanges();
    }, 300); 
  }

  // Abre o modal injetando os dados no componente de relatório

  abrirRelatorio(entrega: any) {
  
    this.entregaSelecionada = entrega as RelatorioEpiData;
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.entregaSelecionada = null;
  }
}