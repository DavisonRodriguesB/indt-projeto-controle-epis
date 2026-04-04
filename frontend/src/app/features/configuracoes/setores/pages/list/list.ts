import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSetor } from './components/modal-setor/modal-setor';

interface Setor {
  id: number;
  nomeSetor: string;
}

@Component({
  selector: 'app-setores-list',
  standalone: true,
  imports: [CommonModule, ModalSetor],
  templateUrl: './list.html'
})
export class SetoresList {
  isModalOpen = false;
  setores: Setor[] = [
    { id: 1, nomeSetor: 'Almoxarifado' },
    { id: 2, nomeSetor: 'Produção' }
  ];

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  salvarSetor(nome: string) {
    const novo: Setor = {
      id: Math.floor(Math.random() * 1000),
      nomeSetor: nome
    };
    this.setores.unshift(novo);
  }

  excluirSetor(id: number) {
    if (confirm('Deseja excluir este setor?')) {
      this.setores = this.setores.filter(s => s.id !== id);
    }
  }
}