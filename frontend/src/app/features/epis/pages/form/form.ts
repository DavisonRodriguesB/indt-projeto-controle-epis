import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-epi-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.html',
  styles: ``
})
export class EpiFormComponent implements OnInit {
  epiForm!: FormGroup;

  categorias = [
    { nome: 'Proteção Auditiva' },
    { nome: 'Proteção Cabeça' },
    { nome: 'Proteção Visual' },
    { nome: 'Proteção das Mãos' },
    
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.epiForm = this.fb.group({
      nome: ['', [Validators.required]],
      codigo: ['', [Validators.required]], // Novo campo
      categoria: ['', [Validators.required]], // Novo campo
      ca: ['', [Validators.required]],
      validade: [null, [Validators.required, Validators.min(1)]]
    });


  }

  onSubmit() {
    if (this.epiForm.valid) {
      const dadosEpi = this.epiForm.value;
      console.log('Objeto pronto para o createEpi do Backend:', dadosEpi);
      
      alert('EPI cadastrado com sucesso!');
      this.router.navigate(['/epis']);
    } else {
      this.epiForm.markAllAsTouched();
    }
  }
}