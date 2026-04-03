import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


export interface Epi {
  id: number;
  nome: string;
  codigo: string;
  numero_ca: string;
  categoria: string;
  vida_util_dias: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
}

@Component({
  selector: 'app-epi-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class List {
  // Dados Mockados para o Catálogo
  epis: Epi[] = [
    { id: 1, codigo: '102940', nome: 'Capacete de Segurança Classe A', numero_ca: '12345', categoria: 'Cabeça', vida_util_dias: 365, estoque_atual: 45, estoque_minimo: 10, ativo: true },
    { id: 2, codigo: '151234', nome: 'Luva Nitrílica G', numero_ca: '98765', categoria: 'Mãos', vida_util_dias: 30, estoque_atual: 8, estoque_minimo: 20, ativo: true },
    { id: 3, codigo: '100293', nome: 'Protetor Auricular Plug', numero_ca: '44556', categoria: 'Auditiva', vida_util_dias: 90, estoque_atual: 100, estoque_minimo: 50, ativo: true },
    { id: 4, codigo: '123024', nome: 'Óculos de Proteção Incolor', numero_ca: '22331', categoria: 'Visual', vida_util_dias: 180, estoque_atual: 2, estoque_minimo: 15, ativo: true },
    { id: 5, codigo: '120402', nome: 'Capa de Chuva Amarela', numero_ca: '2412', categoria: 'Visual', vida_util_dias: 180, estoque_atual: 20, estoque_minimo: 15, ativo: true },
  ];

  searchTerm: string = '';

  get episFiltrados() {
  const termo = this.searchTerm.toLowerCase().trim();

  if (!termo) {
    return this.epis;
  }

  return this.epis.filter(item => {
    return (
      item.nome.toLowerCase().includes(termo) ||
      item.codigo.toLowerCase().includes(termo) ||
      item.numero_ca.toLowerCase().includes(termo)
    );
  });

  }
}