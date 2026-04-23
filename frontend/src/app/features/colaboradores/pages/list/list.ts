import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ColaboradorService, Colaborador } from '../../../../core/services/colaborador.service';
import { BaseService } from '../../../../core/services/base.service';

@Component({
  selector: 'app-colaborador-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html'
})
export class List implements OnInit {
  private colaboradorService = inject(ColaboradorService);
  private baseService = inject(BaseService);
  private cdr = inject(ChangeDetectorRef);

  colaboradores: Colaborador[] = [];
  setores: any[] = [];
  cargos: any[] = [];
  
  searchTerm: string = '';
  
  // Estados para Autocomplete e Chips
  inputSetor: string = '';
  inputCargo: string = '';
  filtroSetor: any = null;
  filtroCargo: any = null;
  showSetores = false;
  showCargos = false;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.colaboradorService.listar().subscribe(res => {
      this.colaboradores = res.data;
      this.cdr.detectChanges();
    });

    this.baseService.listar('setores').subscribe(res => this.setores = res.data);
    this.baseService.listar('cargos').subscribe(res => this.cargos = res.data);
  }

  // Filtra as sugestões do dropdown enquanto o usuário digita
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

  selecionarSetor(setor: any) {
    this.filtroSetor = setor;
    this.inputSetor = '';
    this.showSetores = false;
  }

  selecionarCargo(cargo: any) {
    this.filtroCargo = cargo;
    this.inputCargo = '';
    this.showCargos = false;
  }

  get colaboradoresFiltrados() {
    return this.colaboradores.filter(c => {
      const matchesSearch = c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           c.matricula.includes(this.searchTerm);
      
      const idSetor = c.setorId ?? c.setor_id ?? c.setor?.id;
      const matchesSetor = !this.filtroSetor || idSetor === this.filtroSetor.id;

      const idCargo = c.cargoId ?? c.cargo_id ?? c.cargo?.id;
      const matchesCargo = !this.filtroCargo || idCargo === this.filtroCargo.id;

      return matchesSearch && matchesSetor && matchesCargo;
    });
  }

  toggleStatus(item: Colaborador) {
    const novoStatus = !item.status;
    const payload = { ...item, status: novoStatus, 
      cargoId: item.cargoId ?? item.cargo_id ?? item.cargo?.id,
      setorId: item.setorId ?? item.setor_id ?? item.setor?.id 
    };
    
    this.colaboradorService.atualizar(item.id!, payload).subscribe(() => {
      item.status = novoStatus;
      this.cdr.detectChanges();
    });
  }
}