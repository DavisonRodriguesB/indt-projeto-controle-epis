import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importação dos componentes da pasta shared (ajustado para seus nomes de arquivo)
import { RelatorioepiComponent } from '../../../../shared/components/relatorioepi/relatorioepi';
import { RelatorioEpiData } from '../../../../shared/components/relatorioepi/relatorio-epi.model';

@Component({
  selector: 'app-movimentacao',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RelatorioepiComponent 
  ],
  templateUrl: './movimentacao.html',
  styleUrls: ['./movimentacao.css']
})
export class MovimentacaoComponent implements OnInit {
  
  isModalVisualizarOpen = false;
  isModalReciboOpen = false;

  formSaidaEpi: FormGroup;
  colaboradorFixado: string | null = null;
  itensMovimentacao: any[] = [];
  erroSaldo: string | null = null;

  // Objeto que alimenta o componente de relatório
  dadosParaRelatorio!: RelatorioEpiData;

  usuarioLogado = "DAVISON BENTES"; 

  // Base de dados simulada para buscar Função e Setor reais
  listaColaboradoresCompleta = [
    { nome: 'João Silva', funcao: 'Eletricista de Manutenção', setor: 'Instalações' },
    { nome: 'Maria Oliveira', funcao: 'Operadora de Máquina B', setor: 'Produção' },
    { nome: 'Carlos Souza', funcao: 'Mecânico Industrial', setor: 'Oficina' },
    { nome: 'Ana Costa', funcao: 'Técnica de Segurança', setor: 'SESMT' }
  ];

  // Lista de nomes para o datalist/select
  colaboradores = this.listaColaboradoresCompleta.map(c => c.nome);
  
  estoque = [
    { id: 1, codigo: 'EPI-001', material: 'Capacete de Segurança', ca: '12345', saldo: 15 },
    { id: 2, codigo: 'EPI-002', material: 'Luva Nitrílica', ca: '67890', saldo: 4 },
    { id: 3, codigo: 'EPI-003', material: 'Óculos de Proteção', ca: '11223', saldo: 20 },
    { id: 4, codigo: 'EPI-004', material: 'Protetor Auricular', ca: '44556', saldo: 8 },
  ];

  constructor(private fb: FormBuilder) {
    this.formSaidaEpi = this.fb.group({
      colaborador: ['', Validators.required],
      material: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {}

  incluirItemNaLista() {
    // CORREÇÃO: getRawValue() captura o colaborador mesmo se o campo estiver DISABLED
    const { colaborador, material, quantidade } = this.formSaidaEpi.getRawValue();
    
    // Extrai o código (Ex: "EPI-001") da string do material
    const codigoMaterial = material.split(' - ')[0].trim();
    const itemEstoque = this.estoque.find(i => i.codigo === codigoMaterial);

    if (itemEstoque) {
      if (quantidade > itemEstoque.saldo) {
        this.erroSaldo = `Saldo insuficiente! Disponível: ${itemEstoque.saldo}`;
        return;
      }

      this.itensMovimentacao.push({
        id: Date.now(),
        codigo: itemEstoque.codigo,
        material: itemEstoque.material,
        ca: itemEstoque.ca,
        quantidade: quantidade
      });

      // Trava o colaborador selecionado e desabilita o campo para manter consistência
      this.colaboradorFixado = colaborador;
      this.formSaidaEpi.get('colaborador')?.disable();
      
      this.formSaidaEpi.patchValue({ material: '', quantidade: 1 });
      this.erroSaldo = null;
    }
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
    // Busca os dados detalhados (função/setor) com base no colaborador fixado
    const infoColaborador = this.listaColaboradoresCompleta.find(
      c => c.nome === this.colaboradorFixado
    );

    // Monta o objeto final para o relatório
    this.dadosParaRelatorio = {
      colaborador: this.colaboradorFixado || 'Não Informado',
      funcao: infoColaborador?.funcao || 'Operacional',
      setor: infoColaborador?.setor || 'Geral',
      dataEntrega: new Date(),
      usuarioSistema: this.usuarioLogado,
      itens: [...this.itensMovimentacao]
    };

    // Abre o modal que contém o <app-relatorioepi [dados]="dadosParaRelatorio">
    this.isModalReciboOpen = true;
  }

  imprimirRecibo() {
    window.print();
  }

  // Controles de interface
  openModalVisualizar() { this.isModalVisualizarOpen = true; }
  closeModalVisualizar() { this.isModalVisualizarOpen = false; }
  openModalSaldo() { alert('Funcionalidade de ajuste de estoque disponível em breve.'); }
}