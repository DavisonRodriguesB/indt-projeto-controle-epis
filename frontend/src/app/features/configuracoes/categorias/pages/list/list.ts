import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCategoria } from './components/modal-categoria/modal-categoria';

interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, ModalCategoria],
  templateUrl: './list.html'
})
export class CategoriasList {
  isModalOpen = false;
  
  categorias: Categoria[] = [
    { id: 1, nome: 'Proteção Auditiva', ativo: true },
    { id: 2, nome: 'Proteção Respiratória', ativo: true }
  ];

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  salvarCategoria(nome: string) {
    const nova: Categoria = {
      id: Math.floor(Math.random() * 1000),
      nome: nome,
      ativo: true 
    };
    this.categorias.unshift(nova); 
    this.closeModal();
  }

  toggleStatus(item: Categoria) {
    item.ativo = !item.ativo;
    console.log(`Categoria ${item.nome} alterada para: ${item.ativo ? 'Ativo' : 'Inativo'}`);
  }
}