import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { FormularioEntrega } from './components/formulario-entrega/formulario-entrega';
import { ListaResumo } from './components/lista-resumo/lista-resumo';
import { ModalEntradaSaldo } from './components/modal-entrada-saldo/modal-entrada-saldo';
import {
  ColaboradorApi,
  EpiApi,
  MovimentacaoApiService,
} from './movimentacao-api.service';
import { MovimentacaoQueryService, MovimentacaoRecente } from '../../../../core/services/movimentacao-query.service';

import { RelatorioepiComponent } from '../../../../shared/components/relatorioepi/relatorioepi';
import { RelatorioEpiData } from '../../../../shared/components/relatorioepi/relatorio-epi.model';

@Component({
  selector: 'app-movimentacao',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RelatorioepiComponent,
    FormularioEntrega,
    ListaResumo,
    ModalEntradaSaldo
  ],
  templateUrl: './movimentacao.html',
  styleUrls: ['./movimentacao.css']
})
export class Movimentacao implements OnInit {
  
  
  isModalVisualizarOpen = false;
  isModalReciboOpen = false;
  isModalSaldoOpen = false; 

  
  formSaidaEpi: FormGroup;
  formEntradaSaldo: FormGroup; 
  
  
  colaboradorFixado: string | null = null;
  itensMovimentacao: any[] = [];
  erroSaldo: string | null = null;
  nomeArquivoAnexo: string | null = null;
  erroApi: string | null = null;
  enviandoMovimentacao = false;

  
  dadosParaRelatorio!: RelatorioEpiData;
  usuarioLogado = 'Sistema';

  movimentacoesRecentes: MovimentacaoRecente[] = [];

  private colaboradoresApi: ColaboradorApi[] = [];
  private episApi: EpiApi[] = [];

  
  listaColaboradoresCompleta = [] as Array<{ nome: string; funcao: string; setor: string }>;

  colaboradores = this.listaColaboradoresCompleta.map(c => c.nome);
  
  estoque: Array<{ id: number; codigo: string; material: string; ca: string; saldo: number }> = [];

  constructor(
    private fb: FormBuilder,
    private movimentacaoApi: MovimentacaoApiService,
    private movimentacaoQuery: MovimentacaoQueryService,
    private cdr: ChangeDetectorRef,
  ) {
    this.formSaidaEpi = this.fb.group({
      colaborador: ['', Validators.required],
      material: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });

    this.formEntradaSaldo = this.fb.group({
      materialCodigo: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.erroApi = null;

    this.movimentacaoApi.listColaboradores().subscribe({
      next: (rows) => {
        this.colaboradoresApi = rows;
        this.listaColaboradoresCompleta = rows.map((colab) => ({
          nome: colab.nome,
          funcao: 'Nao informado',
          setor: colab.setor ?? 'Nao informado',
        }));
        this.colaboradores = this.listaColaboradoresCompleta.map((c) => c.nome);
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroApi = 'Falha ao carregar colaboradores.';
        this.cdr.detectChanges();
      },
    });

    this.recarregarEpis();
    this.recarregarMovimentacoesRecentes();
  }

  private recarregarEpis(): void {
    this.movimentacaoApi.listEpis().subscribe({
      next: (rows) => {
        this.episApi = rows;
        this.estoque = rows.map((epi) => ({
          id: epi.id,
          codigo: epi.codigo,
          material: epi.nome,
          ca: epi.ca,
          saldo: epi.estoque_atual,
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroApi = 'Falha ao carregar EPIs.';
        this.cdr.detectChanges();
      },
    });
  }

  private recarregarMovimentacoesRecentes(): void {
    this.movimentacaoQuery.listRecentMovements(10).subscribe({
      next: (rows) => {
        this.movimentacoesRecentes = rows;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroApi = 'Falha ao carregar movimentacoes recentes.';
        this.cdr.detectChanges();
      },
    });
  }

  salvarNovoSaldo() {
    const { materialCodigo, quantidade, observacao } = this.formEntradaSaldo.value;
    const item = this.estoque.find((i) => i.codigo === materialCodigo);

    if (!item || quantidade <= 0) {
      return;
    }

    this.erroApi = null;
    this.enviandoMovimentacao = true;

    this.movimentacaoApi
      .createEntradaSaldo([{ epiId: item.id, quantidade }], observacao)
      .pipe(finalize(() => {
        this.enviandoMovimentacao = false;
      }))
      .subscribe({
        next: () => {
          alert(`Entrada de saldo para ${item.material} registrada com sucesso!`);
          this.closeModalSaldo();
          this.recarregarEpis();
          this.recarregarMovimentacoesRecentes();
        },
        error: () => {
          this.erroApi = 'Nao foi possivel registrar a entrada de saldo.';
        },
      });
  }

  private getColaboradorIdByNome(nome: string | null): number | null {
    if (!nome) {
      return null;
    }

    const colaborador = this.colaboradoresApi.find((row) => row.nome === nome);
    return colaborador?.id ?? null;
  }

  private getEpiIdByCodigo(codigo: string): number | null {
    const epi = this.episApi.find((row) => row.codigo === codigo);
    return epi?.id ?? null;
  }

  private getSelectedEpi(materialInput: string | null): {
    id: number;
    codigo: string;
    material: string;
    ca: string;
    saldo: number;
  } | null {
    if (!materialInput) {
      return null;
    }

    const value = materialInput.trim();
    if (!value) {
      return null;
    }

    const normalized = value.toLowerCase();

    const byFormattedLabel = this.estoque.find(
      (item) => `${item.codigo} - ${item.material} (CA: ${item.ca})`.toLowerCase() === normalized,
    );

    if (byFormattedLabel) {
      return byFormattedLabel;
    }

    const byCodePrefix = value.match(/^([^\s-]+)\s*-/)?.[1]?.trim();
    if (byCodePrefix) {
      const byCode = this.estoque.find((item) => item.codigo === byCodePrefix);
      if (byCode) {
        return byCode;
      }
    }

    const matches = this.estoque.filter(
      (item) =>
        item.codigo.toLowerCase() === normalized ||
        item.material.toLowerCase() === normalized ||
        item.ca.toLowerCase() === normalized,
    );

    if (matches.length === 1) {
      return matches[0];
    }

    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nomeArquivoAnexo = file.name;
    }
  }

  incluirItemNaLista() {
    const { colaborador, material, quantidade } = this.formSaidaEpi.getRawValue();
    const itemEstoque = this.getSelectedEpi(material);

    if (!itemEstoque) {
      this.erroSaldo = 'Selecione um EPI válido da lista (código, nome ou CA).';
      return;
    }

    if (quantidade > itemEstoque.saldo) {
      this.erroSaldo = `Saldo insuficiente! Disponível: ${itemEstoque.saldo}`;
      return;
    }

    const novoItem = {
      id: Date.now(),
      codigo: itemEstoque.codigo,
      material: itemEstoque.material,
      ca: itemEstoque.ca,
      quantidade: quantidade
    };

    this.itensMovimentacao = [...this.itensMovimentacao, novoItem];

    this.colaboradorFixado = colaborador;
    this.formSaidaEpi.get('colaborador')?.disable();
    this.formSaidaEpi.patchValue({ material: '', quantidade: 1 });
    this.erroSaldo = null;
  }

  removerItemLista(id: number) {
    
    this.itensMovimentacao = this.itensMovimentacao.filter(item => item.id !== id);
    if (this.itensMovimentacao.length === 0) {
      this.desafixarColaborador();
    }
  }

  desafixarColaborador() {
    this.itensMovimentacao = [];
    this.colaboradorFixado = null;
    this.formSaidaEpi.get('colaborador')?.enable();
    this.formSaidaEpi.patchValue({ colaborador: '' });
  }

  limparErro() { 
    this.erroSaldo = null; 
  }

  finalizarMovimentacao() {
    const colaboradorId = this.getColaboradorIdByNome(this.colaboradorFixado);
    if (!colaboradorId) {
      this.erroApi = 'Colaborador invalido para finalizar movimentacao.';
      return;
    }

    const itensPayload = this.itensMovimentacao
      .map((item) => ({
        epiId: this.getEpiIdByCodigo(item.codigo),
        quantidade: Number(item.quantidade),
      }))
      .filter((item): item is { epiId: number; quantidade: number } => !!item.epiId && item.quantidade > 0);

    if (itensPayload.length !== this.itensMovimentacao.length) {
      this.erroApi = 'Existem itens invalidos na lista de entrega.';
      return;
    }

    this.erroApi = null;
    this.enviandoMovimentacao = true;

    this.movimentacaoApi
      .createEntrega(colaboradorId, itensPayload)
      .pipe(finalize(() => {
        this.enviandoMovimentacao = false;
      }))
      .subscribe({
        next: (created) => {
          const infoColaborador = this.listaColaboradoresCompleta.find(c => c.nome === this.colaboradorFixado);
          const anoAtual = new Date().getFullYear();
          const numeroProtocoloGerado = `MOV-${anoAtual}-${String(created.id).padStart(6, '0')}`;

          this.dadosParaRelatorio = {
            protocolo: numeroProtocoloGerado,
            colaborador: this.colaboradorFixado || 'Nao Informado',
            funcao: infoColaborador?.funcao || 'Operacional',
            setor: infoColaborador?.setor || 'Geral',
            dataEntrega: new Date(),
            usuarioSistema: this.usuarioLogado,
            itens: [...this.itensMovimentacao]
          };

          this.isModalReciboOpen = true;
          this.desafixarColaborador();
          this.formSaidaEpi.patchValue({ material: '', quantidade: 1 });
          this.recarregarEpis();
          this.recarregarMovimentacoesRecentes();
        },
        error: () => {
          this.erroApi = 'Nao foi possivel finalizar a movimentacao de entrega.';
        },
      });
  }

  formatarData(valor: string): string {
    return new Date(valor).toLocaleDateString('pt-BR');
  }

  tipoMovimentacaoLabel(tipo: 'entrega' | 'entrada_saldo'): string {
    return tipo === 'entrega' ? 'Entrega' : 'Entrada de Saldo';
  }

  imprimirRecibo() { 
    window.print(); 
  }

  
  openModalVisualizar() { this.isModalVisualizarOpen = true; }
  closeModalVisualizar() { this.isModalVisualizarOpen = false; }
  
  openModalSaldo() { this.isModalSaldoOpen = true; }
  closeModalSaldo() { 
    this.isModalSaldoOpen = false; 
    this.formEntradaSaldo.reset({quantidade: 1});
    this.nomeArquivoAnexo = null;
  }
}