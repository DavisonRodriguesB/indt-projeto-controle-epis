import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BaseService } from '../../../../core/services/base.service';
import { ColaboradorService } from '../../../../core/services/colaborador.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
  private notif = inject(NotificationService);

  colaboradorForm!: FormGroup;
  isEdicao = false;
  colaboradorId: number | null = null;
  
  setores: any[] = [];
  cargos: any[] = [];

  ngOnInit(): void {
    this.colaboradorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required]],
      cargo_id: [null, [Validators.required]],
      setor_id: [null, [Validators.required]],
      status: [true]
    });

    this.carregarListasAuxiliares(() => {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam && idParam !== 'novo') {
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
        this.setores = res.data?.filter((s: any) => s.ativo === true) ?? [];
        this.cdr.detectChanges();
        concluir();
      },
      error: () => {
        this.notif.show('Erro ao carregar lista de setores.', 'error');
        concluir();
      }
    });

    this.baseService.listar('cargos').subscribe({
      next: (res: any) => {
        this.cargos = res.data?.filter((c: any) => c.ativo === true) ?? [];
        this.cdr.detectChanges();
        concluir();
      },
      error: () => {
        this.notif.show('Erro ao carregar lista de cargos.', 'error');
        concluir();
      }
    });
  }

  carregarDadosParaEdicao(id: number) {
    this.colaboradorService.buscarPorId(id).subscribe({
      next: (res) => {
        if (res.data) {
          this.colaboradorForm.patchValue(res.data);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.notif.show('Erro ao carregar dados do colaborador.', 'error');
        this.router.navigate(['/colaboradores']);
      }
    });
  }

  onSubmit() {
    if (this.colaboradorForm.valid) {
      const payload = this.colaboradorForm.value;

      const request = (this.isEdicao && this.colaboradorId)
        ? this.colaboradorService.atualizar(this.colaboradorId, payload)
        : this.colaboradorService.salvar(payload);

      request.subscribe({
        next: () => {
          this.notif.show(this.isEdicao ? 'Colaborador atualizado!' : 'Colaborador cadastrado!', 'success');
          this.router.navigate(['/colaboradores']);
        },
        error: (err) => {
          this.notif.show(err.error?.message || 'Erro ao processar colaborador.', 'error');
        }
      });
    }
  }
}