import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-privados',
  templateUrl: './login-privados.component.html',
  styleUrls: ['./login-privados.component.scss']
})
export class LoginPrivadosComponent {

  loginData = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService,
    private toastr: ToastrService,
    private router: Router) { }

    login() {
      this.authService.loginPrivada(this.loginData.email, this.loginData.password).subscribe({
        next: (response) => {
          //console.log('Inicio de sesión exitoso:', response.access_token);
          this.authService.saveToken(response.access_token);
          this.router.navigate(['/privados/PlanillaPrivados']);
        },
        error: (error) => {
          console.error('Error en el inicio de sesión:', error);
          this.toastr.error('Credenciales inválidas o error en el servidor.');
        }
      });
    }



}
