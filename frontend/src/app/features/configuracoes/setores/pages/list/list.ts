import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Adicione este import

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule], // Adicione o CommonModule aqui
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}