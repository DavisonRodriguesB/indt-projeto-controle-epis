import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../../core/http/api-error.service';

import { FormularioEntrega } from './components/formulario-entrega/formulario-entrega';
import { ListaResumo } from './components/lista-resumo/lista-resumo';
import { ModalEntradaSaldo } from './components/modal-entrada-saldo/modal-entrada-saldo';
import {
  ColaboradorApi,
  EpiApi,
  MovimentacaoApiService,
} from './movimentacao-api.service';

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

  private colaboradoresApi: ColaboradorApi[] = [];
  private episApi: EpiApi[] = [];

  listaColaboradoresCompleta: Array<{ nome: string; funcao: string; setor: string }> = [];
  colaboradores: string[] = [];
  estoque: Array<{ id: number; codigo: string; material: string; ca: string; saldo: number }> = [];

  constructor(
    private fb: FormBuilder,
    private movimentacaoApi: MovimentacaoApiService,
    private cdr: ChangeDetectorRef,
    private apiErrorService: ApiErrorService,
  ) {
    this.formSaidaEpi = this.fb.group({
      colaborador: ['', Validators.required],
      epiId: ['', Validators.required],
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
        this.listaColaboradoresCompleta = rows.map((colab: any) => ({
          nome: colab.nome,
          funcao: colab.cargo?.descricao || 'Não informado',
          setor: colab.setor?.descricao || 'Não informado',
        }));
        this.colaboradores = this.listaColaboradoresCompleta.map((c) => c.nome);
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        this.erroApi = this.apiErrorService.getMessage(error, 'Falha ao carregar colaboradores.');
        this.cdr.detectChanges();
      },
    });
    this.recarregarEpis();
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
      error: (error: unknown) => {
        this.erroApi = this.apiErrorService.getMessage(error, 'Falha ao carregar EPIs.');
        this.cdr.detectChanges();
      },
    });
  }

  salvarNovoSaldo() {
    const { materialCodigo, quantidade, observacao } = this.formEntradaSaldo.value;
    const item = this.estoque.find((i) => i.codigo === materialCodigo);
    if (!item || quantidade <= 0) return;

    this.erroApi = null;
    this.enviandoMovimentacao = true;
    this.movimentacaoApi
      .createEntradaSaldo([{ epiId: item.id, quantidade }], observacao)
      .pipe(finalize(() => this.enviandoMovimentacao = false))
      .subscribe({
        next: () => {
          alert(`Entrada de saldo para ${item.material} registrada com sucesso!`);
          this.closeModalSaldo();
          this.recarregarEpis();
        },
        error: (error) => {
          this.erroApi = this.apiErrorService.getMessage(error, 'Nao foi possivel registrar a entrada de saldo.');
        },
      });
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] || event;
    if (file) {
      this.nomeArquivoAnexo = file.name;
    }
  }

  incluirItemNaLista() {
    const { colaborador, epiId, quantidade } = this.formSaidaEpi.getRawValue();
    const selectedEpiId = Number(epiId);
    const itemEstoque = this.estoque.find((item) => item.id === selectedEpiId) ?? null;

    if (!itemEstoque) {
      this.erroSaldo = 'Selecione um EPI valido da lista.';
      return;
    }

    if (quantidade > itemEstoque.saldo) {
      this.erroSaldo = `Saldo insuficiente! Disponível: ${itemEstoque.saldo}`;
      return;
    }

    const novoItem = {
      id: Date.now(),
      epiId: itemEstoque.id,
      codigo: itemEstoque.codigo,
      material: itemEstoque.material,
      ca: itemEstoque.ca,
      quantidade: quantidade
    };

    this.itensMovimentacao = [...this.itensMovimentacao, novoItem];
    this.colaboradorFixado = colaborador;
    this.formSaidaEpi.get('colaborador')?.disable();
    this.formSaidaEpi.patchValue({ epiId: '', quantidade: 1 });
    this.erroSaldo = null;
  }

  removerItemLista(id: number) {
    this.itensMovimentacao = this.itensMovimentacao.filter(item => item.id !== id);
    if (this.itensMovimentacao.length === 0) this.desafixarColaborador();
  }

  desafixarColaborador() {
    this.itensMovimentacao = [];
    this.colaboradorFixado = null;
    this.formSaidaEpi.get('colaborador')?.enable();
    this.formSaidaEpi.patchValue({ colaborador: '' });
  }

  finalizarMovimentacao() {
    const colaboradorId = this.getColaboradorIdByNome(this.colaboradorFixado);
    if (!colaboradorId) {
      this.erroApi = 'Colaborador invalido para finalizar movimentacao.';
      return;
    }

    const itensPayload = this.itensMovimentacao.map((item) => ({
      epiId: Number(item.epiId),
      quantidade: Number(item.quantidade),
    }));

    this.erroApi = null;
    this.enviandoMovimentacao = true;

    this.movimentacaoApi
      .createEntrega(colaboradorId, itensPayload)
      .pipe(finalize(() => this.enviandoMovimentacao = false))
      .subscribe({
        next: (created) => {
          const infoColaborador = this.listaColaboradoresCompleta.find(c => c.nome === this.colaboradorFixado);
          const anoAtual = new Date().getFullYear();
          const numeroProtocoloGerado = `MOV-${anoAtual}-${String(created.id).padStart(6, '0')}`;

          this.dadosParaRelatorio = {
            protocolo: numeroProtocoloGerado,
            colaborador: this.colaboradorFixado || 'Nao Informado',
            funcao: infoColaborador?.funcao || 'Não informado',
            setor: infoColaborador?.setor || 'Não informado',
            dataEntrega: new Date(),
            usuarioSistema: this.usuarioLogado,
            itens: [...this.itensMovimentacao]
          };

          this.isModalReciboOpen = true;
          this.recarregarEpis();
        },
        error: (error) => {
          this.erroApi = this.apiErrorService.getMessage(error, 'Nao foi possivel finalizar a movimentacao de entrega.');
        },
      });
  }

  private getColaboradorIdByNome(nome: string | null): number | null {
    if (!nome) return null;
    const colaborador = this.colaboradoresApi.find((row) => row.nome === nome);
    return colaborador?.id ?? null;
  }

  limparErro() { this.erroSaldo = null; }
  imprimirRecibo() { window.print(); }
  openModalVisualizar() { this.isModalVisualizarOpen = true; }
  closeModalVisualizar() { this.isModalVisualizarOpen = false; }
  openModalSaldo() { this.isModalSaldoOpen = true; }
  closeModalSaldo() { 
    this.isModalSaldoOpen = false; 
    this.formEntradaSaldo.reset({quantidade: 1});
    this.nomeArquivoAnexo = null;
  }
}