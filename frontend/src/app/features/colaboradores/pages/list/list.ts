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
  setoresDisponiveis: any[] = [];
  searchTerm: string = '';
  selectedSetorId: string = '';

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.colaboradorService.listar().subscribe({
      next: (res) => {
        this.colaboradores = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar colaboradores:', err)
    });

    this.baseService.listar('setores').subscribe({
      next: (res) => {
        this.setoresDisponiveis = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar setores:', err)
    });
  }

  toggleStatus(item: Colaborador) {
    if (!item.id) return;

    const novoStatus = !item.status;
    
    const payload = {
      nome: item.nome,
      matricula: item.matricula,
      status: novoStatus,
      cargoId: item.cargoId ?? item.cargo_id ?? item.cargo?.id!,
      setorId: item.setorId ?? item.setor_id ?? item.setor?.id!,
    };

    this.colaboradorService.atualizar(item.id, payload).subscribe({
      next: () => {
        item.status = novoStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao alterar status:', err);
        alert('Não foi possível alterar o status.');
      }
    });
  }

  get colaboradoresFiltrados() {
    return this.colaboradores.filter(c => {
      const matchesSearch =
        c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.matricula.includes(this.searchTerm);

      const idSetor = c.setorId ?? c.setor_id ?? c.setor?.id;
      const matchesSetor =
        this.selectedSetorId === '' || idSetor === Number(this.selectedSetorId);

      return matchesSearch && matchesSetor;
    });
  }
}