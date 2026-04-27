import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ColaboradorService,
  Colaborador,
  EpiColaborador,
  calcularStatusValidade,
  StatusValidade
} from '../../../../core/services/colaborador.service';
import { BaseService } from '../../../../core/services/base.service';

@Component({
  selector: 'app-colaborador-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html'
})
export class List implements OnInit {
  private colaboradorService = inject(ColaboradorService);
  private baseService        = inject(BaseService);
  private cdr                = inject(ChangeDetectorRef);

  colaboradores: Colaborador[] = [];
  setores: any[] = [];
  cargos: any[]  = [];
  searchTerm   = '';
  inputSetor   = '';
  inputCargo   = '';
  filtroSetor: any = null;
  filtroCargo: any = null;
  showSetores  = false;
  showCargos   = false;

  modalAberto              = false;
  colaboradorModal: Colaborador | null = null;
  episModal: EpiColaborador[]          = [];
  carregandoEpis                       = false;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.colaboradorService.listar().subscribe({
      next: (res) => { this.colaboradores = res.data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar colaboradores:', err)
    });
    this.baseService.listar('setores').subscribe({
      next: (res) => { this.setores = res.data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar setores:', err)
    });
    this.baseService.listar('cargos').subscribe({
      next: (res) => { this.cargos = res.data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar cargos:', err)
    });
  }


  get sugestoesSetor() {
    if (!this.inputSetor) return [];
    return this.setores.filter(s =>
      s.descricao.toLowerCase().includes(this.inputSetor.toLowerCase())
    );
  }

  get sugestoesCargo() {
    if (!this.inputCargo) return [];
    return this.cargos.filter(c =>
      c.descricao.toLowerCase().includes(this.inputCargo.toLowerCase())
    );
  }

  selecionarSetor(setor: any): void {
    this.filtroSetor = setor; this.inputSetor = ''; this.showSetores = false;
  }

  selecionarCargo(cargo: any): void {
    this.filtroCargo = cargo; this.inputCargo = ''; this.showCargos = false;
  }

  get colaboradoresFiltrados(): Colaborador[] {
    return this.colaboradores.filter(c => {
      const matchesSearch =
        c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.matricula.includes(this.searchTerm);
      const matchesSetor = !this.filtroSetor || c.setor_id === this.filtroSetor.id;
      const matchesCargo = !this.filtroCargo || c.cargo_id === this.filtroCargo.id;
      return matchesSearch && matchesSetor && matchesCargo;
    });
  }

  toggleStatus(item: Colaborador): void {
    const novoStatus = !item.status;
    this.colaboradorService.atualizar(item.id, { ...item, status: novoStatus }).subscribe({
      next: () => { item.status = novoStatus; this.cdr.detectChanges(); },
      error: (err) => {
        console.error('Erro ao alterar status:', err);
        alert('Não foi possível alterar o status.');
      }
    });
  }


  abrirEpis(colaborador: Colaborador): void {
    this.colaboradorModal = colaborador;
    this.episModal        = [];
    this.carregandoEpis   = true;
    this.modalAberto      = true;
    this.cdr.detectChanges();

    this.colaboradorService.buscarEpis(colaborador.id).subscribe({
      next: (res) => {
        this.episModal      = res.data;
        this.carregandoEpis = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoEpis = false;
        this.cdr.detectChanges();
      }
    });
  }

  fecharModal(): void {
    this.modalAberto      = false;
    this.colaboradorModal = null;
    this.episModal        = [];
  }

  statusValidade(dataVencimento: string | null): StatusValidade {
    return calcularStatusValidade(dataVencimento);
  }
}