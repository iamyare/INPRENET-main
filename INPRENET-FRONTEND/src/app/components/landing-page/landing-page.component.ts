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
      image: 'assets/images/Conference-rafiki.svg',
      title: 'Gestión Integral',
      description: 'Ofrecemos una solución completa para gestionar tus pensiones.'
    },
    {
      image: 'assets/images/Sync-rafiki.svg',
      title: 'Soporte Dedicado',
      description: 'Contamos con un equipo de soporte disponible para ti en todo momento.'
    },
    {
      image: 'assets/images/Teacher-rafiki.svg',
      title: 'Fácil de Usar',
      description: 'Nuestra plataforma es intuitiva y fácil de usar.'
    }
  ];

  constructor(private router: Router,) { }

  login() {
    this.router.navigate(['/auth/login']);
  }
}
