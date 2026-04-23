import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BaseService } from '../../../../core/services/base.service';
import { ColaboradorService } from '../../../../core/services/colaborador.service';

@Component({
  selector: 'app-colaborador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.html',
})
export class ColaboradorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private colaboradorService = inject(ColaboradorService);
  private cdr = inject(ChangeDetectorRef);

  colaboradorForm!: FormGroup;
  isEdicao = false;
  colaboradorId: number | null = null;

  setores: any[] = [];
  cargos: any[] = [];

  ngOnInit(): void {
    this.colaboradorForm = this.fb.group({
      nome:      ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required]],
      cargoId:   [null, [Validators.required]],
      setorId:   [null, [Validators.required]],
      status:    [true, [Validators.required]]
    });

    this.carregarListasAuxiliares(() => {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdicao = true;
        this.colaboradorId = Number(idParam);
        this.carregarDadosParaEdicao(this.colaboradorId);
      }
    });
  }

  carregarListasAuxiliares(callback?: () => void) {
    let pendentes = 2;
    const concluir = () => { if (--pendentes === 0) callback?.(); };

    this.baseService.listar('setores').subscribe({
      next: (res: any) => {
        this.setores = res.data ? res.data.filter((s: any) => s.ativo === true) : [];
        this.cdr.detectChanges();
        concluir();
      },
      error: () => concluir()
    });

    this.baseService.listar('cargos').subscribe({
      next: (res: any) => {
        this.cargos = res.data ? res.data.filter((c: any) => c.ativo === true) : [];
        this.cdr.detectChanges();
        concluir();
      },
      error: () => concluir()
    });
  }

  carregarDadosParaEdicao(id: number) {
    this.colaboradorService.buscarPorId(id).subscribe({
      next: (res) => {
        const dados = res.data;

        this.colaboradorForm.patchValue({
          nome:      dados.nome,
          matricula: dados.matricula,
          cargoId:   dados.cargoId ?? dados.cargo_id ?? dados.cargo?.id,
          setorId:   dados.setorId ?? dados.setor_id ?? dados.setor?.id,
          status:    dados.status
        });
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao carregar dados para edição.')
    });
  }

  onSubmit() {
    if (this.colaboradorForm.valid) {
      const v = this.colaboradorForm.value;

      const payload = {
        nome:      v.nome,
        matricula: v.matricula,
        cargoId:   Number(v.cargoId),
        setorId:   Number(v.setorId),
        status:    v.status
      };

      const request = (this.isEdicao && this.colaboradorId)
        ? this.colaboradorService.atualizar(this.colaboradorId, payload)
        : this.colaboradorService.salvar(payload);

      request.subscribe({
        next: () => this.router.navigate(['/colaboradores']),
        error: (err) => {
          console.error('Erro ao salvar:', err);
          alert(err.error?.message || 'Erro na operação.');
        }
      });
    }
  }
}