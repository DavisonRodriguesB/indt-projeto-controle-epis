import { Component, Input, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { RelatorioEpiData } from './relatorio-epi.model';

registerLocaleData(localePt);

@Component({
  selector: 'app-relatorioepi',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './relatorioepi.html',
  styleUrls: ['./relatorioepi.css']
})
export class RelatorioepiComponent {
  @Input() dados: RelatorioEpiData | null = null;

  imprimir(): void {
    window.print();
  }
}