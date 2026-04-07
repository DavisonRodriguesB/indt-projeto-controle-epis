import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCargo } from './components/modal-cargo/modal-cargo';

interface Cargo {
  id: number;
  descricao: string;
  ativo: boolean; 
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

  cargos: Cargo[] = [
    { id: 1, descricao: 'Técnico de Segurança', ativo: true },
    { id: 2, descricao: 'Almoxarife', ativo: true },
    { id: 3, descricao: 'Operador de Empilhadeira', ativo: false }
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
      descricao: novaDescricao,
      ativo: true 
    };

    this.cargos.unshift(novoCargo);
    this.closeModal();
  }

  
  toggleStatus(cargo: Cargo) {
    cargo.ativo = !cargo.ativo;
    console.log(`Cargo ${cargo.descricao} agora está: ${cargo.ativo ? 'Ativo' : 'Inativo'}`);
  }
}