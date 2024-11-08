import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  features = [
    {
      image: '../../../assets/images/Document-rafiki.svg',
      title: 'Gestión de Afiliados',
      description: 'Administra la información de los maestros afiliados de manera centralizada y segura.'
    },
    {
      image: '../../../assets/images/Analytics-rafiki.svg',
      title: 'Consulta de Beneficios',
      description: 'Accede a un resumen claro y detallado de los beneficios disponibles para cada afiliado.'
    },
    {
      image: '../../../assets/images/Sync-rafiki.svg',
      title: 'Soporte al Cliente',
      description: 'Un equipo de soporte dedicado para resolver todas tus dudas y consultas.'
    },
    {
      image: '../../../assets/images/Ease of Use-rafiki.svg',
      title: 'Facilidad de Uso',
      description: 'Una interfaz intuitiva y amigable diseñada para una experiencia de usuario óptima.'
    }
  ];

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/login']);
  }
}
