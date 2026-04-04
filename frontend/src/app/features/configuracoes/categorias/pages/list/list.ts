import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCategoria } from './components/modal-categoria/modal-categoria';

interface Categoria {
  id: number;
  nome: string;
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
    { id: 1, nome: 'Proteção Auditiva' },
    { id: 2, nome: 'Proteção Respiratória' }
  ];

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  salvarCategoria(nome: string) {
    const nova: Categoria = {
      id: Math.floor(Math.random() * 1000),
      nome: nome
    };
    this.categorias.unshift(nova); 
  }

  excluirCategoria(id: number) {
    if (confirm('Deseja excluir esta categoria?')) {
      this.categorias = this.categorias.filter(c => c.id !== id);
    }
  }
}