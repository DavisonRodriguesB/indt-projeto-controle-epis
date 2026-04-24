import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCategoria } from './components/modal-categoria/modal-categoria';
import { BaseService } from '../../../../../core/services/base.service';
import { BaseItem } from '../../../../../core/models/base-item.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, ModalCategoria],
  templateUrl: './list.html'
})
export class CategoriasList implements OnInit {
  isModalOpen = false;
  categorias = signal<BaseItem[]>([]);
  categoriaSelecionada = signal<BaseItem | null>(null);

  private baseService = inject(BaseService);

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.baseService.listarTodos('categorias').subscribe({
      next: (res) => this.categorias.set(res.data),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar categorias:', err.message)
    });
  }

  toggleStatus(item: BaseItem) {
    if (!item.id) return;
    const novoStatus = !item.ativo;
    this.baseService.alterarStatus('categorias', item.id, item.descricao, novoStatus).subscribe({
      next: () => {
        this.categorias.update((lista) =>
          lista.map((categoria) =>
            categoria.id === item.id ? { ...categoria, ativo: novoStatus } : categoria
          )
        );
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao alterar status da categoria:', err.message)
    });
  }

  openModal(categoria?: BaseItem) {
    this.categoriaSelecionada.set(categoria || null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoriaSelecionada.set(null);
  }

  salvarCategoria(dados: { id?: number, descricao: string }) {
    if (dados.id) {
      const statusAtual = this.categorias().find(c => c.id === dados.id)?.ativo ?? true;
      this.baseService.alterarStatus('categorias', dados.id, dados.descricao, statusAtual).subscribe({
        next: () => {
          this.carregarCategorias();
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao atualizar categoria:', err.message)
      });
    } else {
      this.baseService.salvar('categorias', { descricao: dados.descricao }).subscribe({
        next: () => {
          this.carregarCategorias();
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao salvar categoria:', err.message)
      });
    }
  }
}