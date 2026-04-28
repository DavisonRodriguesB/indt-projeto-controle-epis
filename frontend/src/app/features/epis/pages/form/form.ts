import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BaseService } from '../../../../core/services/base.service';
import { EpiService } from '../../../../core/services/epi.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-epi-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.html',
})
export class EpiFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private epiService = inject(EpiService);
  private cdr = inject(ChangeDetectorRef);
  private notif = inject(NotificationService);

  epiForm!: FormGroup;
  isEdicao = false;
  epiId: number | null = null;
  categorias: any[] = [];

  ngOnInit(): void {
    this.epiForm = this.fb.group({
      nome: ['', [Validators.required]],
      codigo: [''],
      ca: ['', [Validators.required]],
      categoriaId: [null, [Validators.required]],
      vidaUtilDias: [365, [Validators.required]],
      validade: ['', [Validators.required]],
      estoqueAtual: [0, [Validators.required, Validators.min(0)]],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]],
      ativo: [true]
    });

    this.carregarCategorias(() => {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdicao = true;
        this.epiId = Number(idParam);
        this.carregarDadosParaEdicao(this.epiId);
      }
    });
  }

  carregarCategorias(callback?: () => void) {
    this.baseService.listar('categorias').subscribe({
      next: (res: any) => {
        this.categorias = res.data ? res.data.filter((c: any) => c.ativo === true) : [];
        this.cdr.detectChanges();
        callback?.();
      },
      error: () => {
        this.notif.show('Erro ao carregar categorias.', 'error');
        callback?.();
      }
    });
  }

  carregarDadosParaEdicao(id: number) {
    this.epiService.buscarPorId(id).subscribe({
      next: (res) => {
        const d = res.data;
        this.epiForm.patchValue({
          nome: d.nome,
          codigo: d.codigo,
          ca: d.ca,
          categoriaId: d.categoria_id,
          vidaUtilDias: d.vida_util_dias,
          validade: d.validade, 
          estoqueAtual: d.estoque_atual,
          estoqueMinimo: d.estoque_minimo,
          ativo: d.ativo
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.notif.show('Erro ao carregar dados do EPI.', 'error');
        this.router.navigate(['/epis']);
      }
    });
  }

  onSubmit() {
    if (this.epiForm.valid) {
      const v = this.epiForm.value;
      const payload = {
        ...v,
        categoriaId: Number(v.categoriaId),
        estoqueAtual: Number(v.estoqueAtual),
        estoqueMinimo: Number(v.estoqueMinimo),
        vidaUtilDias: Number(v.vidaUtilDias)
      };

      const request = (this.isEdicao && this.epiId)
        ? this.epiService.atualizar(this.epiId, payload)
        : this.epiService.salvar(payload);

      request.subscribe({
        next: () => {
          this.notif.show(this.isEdicao ? 'EPI atualizado com sucesso!' : 'EPI cadastrado com sucesso!', 'success');
          this.router.navigate(['/epis']);
        },
        error: (err) => {
          this.notif.show(err.error?.message || 'Erro ao salvar EPI.', 'error');
        }
      });
    }
  }
}