import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSetor } from './components/modal-setor/modal-setor';

interface Setor {
  id: number;
  nomeSetor: string;
  ativo: boolean;
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
    { id: 1, nomeSetor: 'Almoxarifado', ativo: true },
    { id: 2, nomeSetor: 'Produção', ativo: true }
  ];

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  salvarSetor(nome: string) {
    const novo: Setor = {
      id: Math.floor(Math.random() * 1000),
      nomeSetor: nome,
      ativo: true 
    };
    this.setores.unshift(novo);
    this.closeModal();
  }

  toggleStatus(item: Setor) {
    item.ativo = !item.ativo;
    console.log(`Setor ${item.nomeSetor} alterado para: ${item.ativo ? 'Ativo' : 'Inativo'}`);
  }
}