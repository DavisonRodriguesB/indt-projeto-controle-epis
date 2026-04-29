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
  inputCategoria: string = '';
  filtroCategoria: any = null;
  showSugestoes = false;

  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.epiService.listar().subscribe({
      next: (res: any) => {
        this.epis = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar EPIs:', err)
    });

    this.baseService.listar('categorias').subscribe({
      next: (res: any) => {
        this.categorias = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar Categorias:', err)
    });
  }

  get sugestoesCategoria() {
    if (!this.inputCategoria) return [];
    return this.categorias.filter(c => 
      c.descricao && c.descricao.toLowerCase().includes(this.inputCategoria.toLowerCase())
    );
  }

  selecionarCategoria(cat: any) {
    this.filtroCategoria = cat;
    this.inputCategoria = '';
    this.showSugestoes = false;
    this.paginaAtual = 1;
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
    if (!this.epis) return [];
    
    return this.epis.filter(e => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch = 
        (e.nome?.toLowerCase().includes(search)) || 
        (e.ca?.includes(search)) || 
        (e.codigo?.toLowerCase().includes(search));
      
      const matchesCat = !this.filtroCategoria || e.categoria_id === this.filtroCategoria.id;
      
      return matchesSearch && matchesCat;
    });
  }

  get episPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.episFiltrados.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.episFiltrados.length / this.itensPorPagina);
  }

  get listaDePaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }
}
