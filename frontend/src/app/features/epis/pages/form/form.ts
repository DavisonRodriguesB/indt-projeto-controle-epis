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

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.epiForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      ca: ['', [Validators.required]],
      // No seu service, validade parece ser um número (dias) ou data. 
      // Se for dias de vida útil, manteremos como número.
      validade: [null, [Validators.required, Validators.min(1)]],
      estoqueAtual: [0, [Validators.required, Validators.min(0)]],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]]
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