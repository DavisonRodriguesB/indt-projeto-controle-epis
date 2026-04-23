import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FiltroConsultaComponent } from './components/filtro-consulta/filtro-consulta';
import { TabelaConsultaComponent } from './components/tabela-consulta/tabela-consulta';
import { RelatorioepiComponent } from '../../shared/components/relatorioepi/relatorioepi';
import { RelatorioEpiData } from '../../shared/components/relatorioepi/relatorio-epi.model';

import { EntregaCompleta } from '../../core/models/consulta.model';
import { ConsultaService } from '../../core/services/consulta.service';

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
  
  listaEntregas: EntregaCompleta[] = []; 
  entregaSelecionada: RelatorioEpiData | null = null;
  exibirModal = false;
  loading = false;

  constructor(private consultaService: ConsultaService) {}

  ngOnInit(): void {}

  executarBusca(filtros: any) {
    this.loading = true;
    this.consultaService.buscarEntregas(filtros).subscribe({
      next: (res) => { 
        this.listaEntregas = res; 
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro na busca:', err);
        this.loading = false;
      }
    });
  }

  abrirRelatorio(entrega: EntregaCompleta) {
    let dataObjeto: Date;
    try {
      dataObjeto = new Date(entrega.data_hora);
      if (isNaN(dataObjeto.getTime())) {
        throw new Error('Data inválida');
      }
    } catch (e) {
      dataObjeto = new Date(); 
    }

    this.entregaSelecionada = {
      protocolo: entrega.id,
      colaborador: entrega.colaborador,
      funcao: entrega.cargo || 'Não Informado',
      setor: entrega.setor || 'Geral',
      dataEntrega: dataObjeto,
      usuarioSistema: entrega.usuario_emissor || 'Sistema', 
      itens: (entrega.itens || []).map(item => ({
        codigo: 'N/A',
        material: item.nome,
        ca: item.numero_ca,
        quantidade: item.quantidade
      }))
    };
    
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.entregaSelecionada = null;
  }

  imprimir() {
    setTimeout(() => {
      window.print();
    }, 100);
  }
}