import { Component, OnInit, inject } from '@angular/core';
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
  setores: BaseItem[] = [];

  private baseService = inject(BaseService);

  ngOnInit() {
    this.carregarSetores();
  }

  carregarSetores() {
    this.baseService.listar('setores').subscribe({
      next: (res) => {
        
        this.setores = res.data || res;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar setores:', err.message);
      }
    });
  }

  openModal() { 
    this.isModalOpen = true; 
  }

  closeModal() { 
    this.isModalOpen = false; 
  }

  salvarSetor(descricao: string) {
    const novoSetor = { descricao };

    this.baseService.salvar('setores', novoSetor).subscribe({
      next: () => {
        this.carregarSetores();
        this.closeModal();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao salvar setor. Verifique se o Login é necessário:', err.message);
      }
    });
  }

  toggleStatus(item: BaseItem) {
    if (!item.id) return;
    
    const novoStatus = !item.ativo;
    this.baseService.alterarStatus('setores', item.id, item.descricao, novoStatus).subscribe({
      next: () => {
        item.ativo = novoStatus;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao alterar status:', err.message);
      }
    });
  }
}