import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  imports: [CommonModule, FormsModule, FiltroConsultaComponent, TabelaConsultaComponent, RelatorioepiComponent],
  templateUrl: './consulta-entregas.html'
})
export class ConsultaEntregasComponent implements OnInit {
  listaEntregas: EntregaCompleta[] = [];
  entregaSelecionada: RelatorioEpiData | null = null;
  exibirModal = false;
  loading = false;

  constructor(
    private consultaService: ConsultaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  imprimir(): void {
    setTimeout(() => window.print(), 250);
  }

  executarBusca(filtros: any): void {
    if (!filtros) {
      this.listaEntregas = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.consultaService.buscarEntregas(filtros).subscribe({
      next: (res) => {
        this.listaEntregas = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirRelatorio(entrega: EntregaCompleta): void {
    const dataStr = entrega.data_hora?.includes('T')
      ? entrega.data_hora
      : `${entrega.data_hora}T00:00:00`;

    const dataObjeto = new Date(dataStr);

    this.entregaSelecionada = {
      protocolo: `MOV-${dataObjeto.getFullYear()}-${entrega.id.toString().padStart(6, '0')}`,
      colaborador: `${entrega.colaborador} (${entrega.matricula})`,
      funcao:      { descricao: entrega.cargo },
      setor:       { descricao: entrega.setor },
      dataEntrega: dataObjeto,
      usuarioSistema: entrega.usuario_emissor,
      itens: entrega.itens.map(item => ({
        codigo:    item.codigo_material,
        material:  item.nome,
        ca:        item.numero_ca,
        quantidade: item.quantidade
      }))
    };

    this.exibirModal = true;
    this.cdr.detectChanges();
  }

  fecharModal(): void {
    this.exibirModal = false;
    this.entregaSelecionada = null;
    this.cdr.detectChanges();
  }
}