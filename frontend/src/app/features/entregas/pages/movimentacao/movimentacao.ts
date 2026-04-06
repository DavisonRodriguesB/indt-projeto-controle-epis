import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { FormularioEntrega } from './components/formulario-entrega/formulario-entrega';
import { ListaResumo } from './components/lista-resumo/lista-resumo';
import { ModalEntradaSaldo } from './components/modal-entrada-saldo/modal-entrada-saldo';

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
  
  // Controles de estado dos Modais
  isModalVisualizarOpen = false;
  isModalReciboOpen = false;
  isModalSaldoOpen = false; 

  // Formulários
  formSaidaEpi: FormGroup;
  formEntradaSaldo: FormGroup; 
  
  // Estado da Movimentação
  colaboradorFixado: string | null = null;
  itensMovimentacao: any[] = [];
  erroSaldo: string | null = null;
  nomeArquivoAnexo: string | null = null;

  // Dados para o Relatório (Shared Component)
  dadosParaRelatorio!: RelatorioEpiData;
  usuarioLogado = "DAVISON BENTES"; 

  // Dados de Simulação (Mock)
  listaColaboradoresCompleta = [
    { nome: 'Bruce Wayne', funcao: 'Eletricista de Manutenção', setor: 'Instalações' },
    { nome: 'Tony Stark', funcao: 'Operadora de Máquina B', setor: 'Produção' },
    { nome: 'Steve Rogers', funcao: 'Mecânico Industrial', setor: 'Oficina' },
    { nome: 'Natasha Romanoff', funcao: 'Técnica de Segurança', setor: 'SESMT' }
  ];

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

 
    this.formEntradaSaldo = this.fb.group({
      materialCodigo: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      observacao: ['']
    });
  }

  ngOnInit(): void {}

  
  salvarNovoSaldo() {
    const { materialCodigo, quantidade, observacao } = this.formEntradaSaldo.value;
    const item = this.estoque.find(i => i.codigo === materialCodigo);

    if (item) {
      item.saldo += quantidade;
      alert(`Saldo de ${item.material} atualizado com sucesso!`);
      this.closeModalSaldo();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nomeArquivoAnexo = file.name;
    }
  }


  incluirItemNaLista() {
    const { colaborador, material, quantidade } = this.formSaidaEpi.getRawValue();
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
    const infoColaborador = this.listaColaboradoresCompleta.find(c => c.nome === this.colaboradorFixado);
    
    this.dadosParaRelatorio = {
      colaborador: this.colaboradorFixado || 'Não Informado',
      funcao: infoColaborador?.funcao || 'Operacional',
      setor: infoColaborador?.setor || 'Geral',
      dataEntrega: new Date(),
      usuarioSistema: this.usuarioLogado,
      itens: [...this.itensMovimentacao]
    };
    
    this.isModalReciboOpen = true;
  }

  imprimirRecibo() { 
    window.print(); 
  }

  // --- Controles de Interface (Modais) ---
  openModalVisualizar() { this.isModalVisualizarOpen = true; }
  closeModalVisualizar() { this.isModalVisualizarOpen = false; }
  
  openModalSaldo() { this.isModalSaldoOpen = true; }
  closeModalSaldo() { 
    this.isModalSaldoOpen = false; 
    this.formEntradaSaldo.reset({quantidade: 1});
    this.nomeArquivoAnexo = null;
  }
}