import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSetor } from './components/modal-setor/modal-setor';
import { BaseService } from '../../../../../core/services/base.service';
import { BaseItem } from '../../../../../core/models/base-item.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-setores-list',
  standalone: true,
  imports: [CommonModule, ModalSetor],
  templateUrl: './list.html'
})
export class SetoresList implements OnInit {
  isModalOpen = false;
  setores = signal<BaseItem[]>([]);
  setorSelecionado = signal<BaseItem | null>(null);

  private baseService = inject(BaseService);

  ngOnInit() {
    this.carregarSetores();
  }

  carregarSetores() {
    this.baseService.listar('setores').subscribe({
      next: (res) => {
        this.setores.set(res.data);
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao carregar:', err.message)
    });
  }

  openModal(setor?: BaseItem) { 
    this.setorSelecionado.set(setor || null);
    this.isModalOpen = true; 
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.setorSelecionado.set(null);
  }

  salvarSetor(dados: { id?: number, descricao: string }) {
    if (dados.id) {
      const setorAtual = this.setores().find(s => s.id === dados.id);
      const statusAtivo = setorAtual ? setorAtual.ativo : true;

      this.baseService.alterarStatus('setores', dados.id, dados.descricao, statusAtivo).subscribe({
        next: () => {
          this.carregarSetores();
          this.closeModal();
        }
      });
    } else {
      this.baseService.salvar('setores', { descricao: dados.descricao }).subscribe({
        next: () => {
          this.carregarSetores();
          this.closeModal();
        }
      });
    }
  }

  toggleStatus(item: BaseItem) {
    if (!item.id) return;
    
    const novoStatus = !item.ativo;
    this.baseService.alterarStatus('setores', item.id, item.descricao, novoStatus).subscribe({
      next: () => {
        this.setores.update(lista => {
          return lista.map(s => s.id === item.id ? { ...s, ativo: novoStatus } : s);
        });
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao alterar status:', err.message)
    });
  }
}