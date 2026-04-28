import { Component, Input, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { RelatorioEpiData } from './relatorio-epi.model';
import { AuthService } from '../../../core/auth/auth.service';

registerLocaleData(localePt);

@Component({
  selector: 'app-relatorioepi',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './relatorioepi.html',
  styleUrls: ['./relatorioepi.css']
})
export class RelatorioepiComponent implements OnInit {
  @Input() dados: RelatorioEpiData | null = null;
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.ajustarUsuarioEmitente();
  }

  private ajustarUsuarioEmitente(): void {
    if (this.dados) {
      const nomeReal = this.authService.currentUser()?.nome;
      
      if (nomeReal && (!this.dados.usuarioSistema || this.dados.usuarioSistema.toLowerCase() === 'sistema')) {
        this.dados.usuarioSistema = nomeReal;
      }
    }
  }

  imprimir(): void {
    window.print();
  }
}