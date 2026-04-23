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
  
  // Controle de Autocomplete e Fixação
  inputCategoria: string = '';
  filtroCategoria: any = null;
  showSugestoes = false;

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

  get sugestoesCategoria() {
    if (!this.inputCategoria) return [];
    return this.categorias.filter(c => 
      c.descricao.toLowerCase().includes(this.inputCategoria.toLowerCase())
    );
  }

  selecionarCategoria(cat: any) {
    this.filtroCategoria = cat;
    this.inputCategoria = '';
    this.showSugestoes = false;
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
      }
    });
  }

  get episFiltrados() {
    return this.epis.filter(e => {
      const matchesSearch = e.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           e.ca.includes(this.searchTerm) || 
                           (e.codigo && e.codigo.includes(this.searchTerm));
      
      const idCat = e.categoria_id;
      const matchesCat = !this.filtroCategoria || idCat === this.filtroCategoria.id;
      
      return matchesSearch && matchesCat;
    });
  }
}