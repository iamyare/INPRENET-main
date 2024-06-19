import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-default',
  templateUrl: './nav-default.component.html',
  styleUrl: './nav-default.component.scss'
})
export class NavDefaultComponent {

  constructor(private authService: AuthService, private toastr: ToastrService,
    private router: Router) {

  }

  cerrarSesion() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login-privados']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.toastr.error('Error al cerrar sesión.');
      }
    });
  }
}
