import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioFormComponent } from '../form/form';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioFormComponent],
  templateUrl: './list.html'
})
export class UsuarioListComponent implements OnInit {
  searchTerm: string = '';
  selectedRole: string = '';
  isModalOpen: boolean = false;
  selectedUser: any = null;

  
  usuarios: any[] = [
    { id: 1, nome: 'Davison Bentes', email: 'davison@admin.com', perfil: 'Admin', ativo: true },
    { id: 2, nome: 'Operador Padrão', email: 'almoxarife@empresa.com', perfil: 'Almoxarife', ativo: true }
  ];

  constructor() {}

  ngOnInit(): void {}

  get usuariosFiltrados() {
    return this.usuarios.filter(user => {
      const matchesSearch = user.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole ? user.perfil === this.selectedRole : true;
      return matchesSearch && matchesRole;
    });
  }

  openModal() {
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  editUser(user: any) {
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  saveUser(userData: any) {
    if (this.selectedUser) {
      const index = this.usuarios.findIndex(u => u.id === this.selectedUser.id);
      this.usuarios[index] = { ...this.selectedUser, ...userData };
    } else {
      const newId = this.usuarios.length + 1;
      this.usuarios.push({ id: newId, ...userData });
    }
    this.closeModal();
  }

  toggleStatus(user: any) {
    user.ativo = !user.ativo;
  }
}