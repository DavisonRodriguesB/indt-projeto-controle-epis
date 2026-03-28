import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; //Import para renderizar rotas filhas
import { SidebarComponent } from '../components/sidebar/sidebar'; // Componente do Menu
import { HeaderComponent } from '../components/header/header'; // Componente do Topo

@Component({
  selector: 'app-main-layout',
  standalone: true,
  //Registrando os componentes necessários para a moldura do sistema
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent {}