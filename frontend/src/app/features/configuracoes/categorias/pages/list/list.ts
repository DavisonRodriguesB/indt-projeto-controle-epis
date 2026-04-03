import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias-epi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './list.html',
})
export class CategoriasEpiComponent implements OnInit {
  categoriaForm!: FormGroup;
  isModalOpen = false; 
  
  categorias = [
    { id: 1, nome: 'Proteção Auditiva' },
    { id: 2, nome: 'Proteção Cabeça' },
    { id: 3, nome: 'Proteção Visual' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // Funções do Modal
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoriaForm.reset();
  }

  onSubmit(): void {
    if (this.categoriaForm.valid) {
      const novaCategoria = {
        id: Date.now(),
        nome: this.categoriaForm.value.nome
      };
      
      this.categorias = [novaCategoria, ...this.categorias];
      this.closeModal(); // Fecha o modal após salvar
    }
  }

  removerCategoria(id: number): void {
    this.categorias = this.categorias.filter(cat => cat.id !== id);
  }
}