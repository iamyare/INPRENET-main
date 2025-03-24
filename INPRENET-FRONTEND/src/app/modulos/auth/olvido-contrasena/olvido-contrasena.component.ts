import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-olvido-contrasena',
  templateUrl: './olvido-contrasena.component.html',
  styleUrls: ['./olvido-contrasena.component.scss']
})
export class OlvidoContrasenaComponent {
  email: string = '';
  cargando: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.cargando = true;
    this.authService.recuperarContrasena(this.email).subscribe({
      next: () => {
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }




}
