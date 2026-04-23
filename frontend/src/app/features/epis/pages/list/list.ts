import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EpiService, Epi } from '../../../../core/services/epi.service';
import { BaseService } from '../../../../core/services/base.service';

@Component({
  selector: 'app-epi-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html'
})
export class List implements OnInit {
  private epiService = inject(EpiService);
  private baseService = inject(BaseService);
  private cdr = inject(ChangeDetectorRef);

  epis: Epi[] = [];
  categorias: any[] = [];
  searchTerm: string = '';
  selectedCategoriaId: string = '';

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.epiService.listar().subscribe({
      next: (res) => {
        this.epis = res.data;
        this.cdr.detectChanges();
      }
    });

    this.baseService.listar('categorias').subscribe({
      next: (res) => {
        this.categorias = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(item: Epi) {
    const novoStatus = !item.ativo;
    
    const payload = {
      nome: item.nome,
      ca: item.ca,
      validade: item.validade,
      estoqueAtual: item.estoque_atual,
      estoqueMinimo: item.estoque_minimo,
      categoriaId: item.categoria_id,
      vidaUtilDias: item.vida_util_dias,
      codigo: item.codigo,
      ativo: novoStatus
    };

    this.epiService.atualizar(item.id, payload).subscribe({
      next: () => {
        item.ativo = novoStatus;
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao alterar status do EPI.')
    });
  }

  get episFiltrados() {
    return this.epis.filter(e => {
      const matchesSearch = e.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || e.ca.includes(this.searchTerm);
      const matchesCat = this.selectedCategoriaId === '' || e.categoria_id === Number(this.selectedCategoriaId);
      return matchesSearch && matchesCat;
    });
  }
}