import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCargo } from './components/modal-cargo/modal-cargo';
import { BaseService } from '../../../../../core/services/base.service';
import { BaseItem } from '../../../../../core/models/base-item.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ModalCargo],
  templateUrl: './list.html'
})
export class List implements OnInit {
  isModalOpen = false;
  cargos = signal<BaseItem[]>([]);
  cargoSelecionado = signal<BaseItem | null>(null);

  private baseService = inject(BaseService);

  ngOnInit() {
    this.carregarCargos();
  }

  carregarCargos() {
    this.baseService.listar('cargos').subscribe({
      next: (res) => this.cargos.set(res.data),
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar cargos:', err.message)
    });
  }

  openModal(cargo?: BaseItem) {
    this.cargoSelecionado.set(cargo || null);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.cargoSelecionado.set(null);
  }

  salvarCargo(dados: { id?: number, descricao: string }) {
    if (dados.id) {
      const statusAtual = this.cargos().find(c => c.id === dados.id)?.ativo ?? true;
      this.baseService.alterarStatus('cargos', dados.id, dados.descricao, statusAtual).subscribe({
        next: () => {
          this.carregarCargos();
          this.closeModal();
        }
      });
    } else {
      this.baseService.salvar('cargos', { descricao: dados.descricao }).subscribe({
        next: () => {
          this.carregarCargos();
          this.closeModal();
        }
      });
    }
  }

  toggleStatus(item: BaseItem) {
    if (!item.id) return;
    const novoStatus = !item.ativo;
    this.baseService.alterarStatus('cargos', item.id, item.descricao, novoStatus).subscribe({
      next: () => {
        this.cargos.update(lista => 
          lista.map(c => c.id === item.id ? { ...c, ativo: novoStatus } : c)
        );
      }
    });
  }
}