import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatorioEpiData } from './relatorio-epi.model';

@Component({
  selector: 'app-relatorioepi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorioepi.html',
  styleUrls: ['./relatorioepi.css']
})
export class RelatorioepiComponent {
  @Input({ required: true }) dados!: RelatorioEpiData;
}