import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCargo } from './components/modal-cargo/modal-cargo';


interface Cargo {
  id: number;
  descricao: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ModalCargo],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  isModalOpen = false;

  // MOCK: Simulando dados que viriam do Banco de Dados
  cargos: Cargo[] = [
    { id: 1, descricao: 'Técnico de Segurança' },
    { id: 2, descricao: 'Almoxarife' },
    { id: 3, descricao: 'Operador de Empilhadeira' }
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

 
  salvarCargo(novaDescricao: string) {
    
    
    const novoCargo: Cargo = {
      id: Math.floor(Math.random() * 1000),
      descricao: novaDescricao
    };

    this.cargos.unshift(novoCargo);
    console.log('Cargo cadastrado com sucesso:', novoCargo);
  }

  
  excluirCargo(id: number) {
    if (confirm('Deseja realmente excluir este cargo?')) {
      this.cargos = this.cargos.filter(c => c.id !== id);
      console.log('Cargo removido:', id);
    }
  }
}