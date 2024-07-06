import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-olvido-contrasena',
  templateUrl: './olvido-contrasena.component.html',
  styleUrls: ['./olvido-contrasena.component.scss']
})
export class OlvidoContrasenaComponent {
  forgotPasswordDto: any = {
    email: '',
    question1Answer: '',
    question2Answer: '',
    question3Answer: ''
  };
  preguntasSeguridad: string[] = [];
  cargando: boolean = false;

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  obtenerPreguntas() {
    this.cargando = true;
    this.authService.obtenerPreguntasSeguridad(this.forgotPasswordDto.email).subscribe({
      next: (preguntas) => {
        this.preguntasSeguridad = preguntas;
        this.cargando = false;
      },
      error: (error) => {
        this.snackBar.open('Error al obtener las preguntas de seguridad', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
        this.cargando = false;
      }
    });
  }

  onSubmit() {
    this.cargando = true;
    this.authService.olvidoContrasena(this.forgotPasswordDto).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Cerrar', {
          duration: 3000,
        });
        this.cargando = false;
      },
      error: (error) => {
        this.snackBar.open('Error al enviar el enlace de restablecimiento', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
        this.cargando = false;
      }
    });
  }
}
