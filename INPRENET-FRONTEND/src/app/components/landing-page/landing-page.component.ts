import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  features = [
    {
      image: '../assets/images/Conference-rafiki.svg',
      title: 'Gestión de Trámites',
      description: 'Facilita la gestión de trámites administrativos de manera rápida y organizada.'
    },
    {
      image: '../assets/images/Sync-rafiki.svg',
      title: 'Generación de Constancias y Reportes',
      description: 'Emite constancias y genera reportes de trámites realizados para los pensionados de manera ágil y segura.'
    },
    
    {
      image: '../assets/images/Teacher-rafiki.svg',
      title: 'Interfaz Intuitiva',
      description: 'Navega fácilmente por los diferentes servicios con una experiencia amigable y moderna.'
    }
  ];

  constructor(private router: Router,) { }

  login() {
    this.router.navigate(['/login']);
  }
}
