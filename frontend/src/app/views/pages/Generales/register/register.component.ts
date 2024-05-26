import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  preguntaSeguridad: any[] = [];
  archivo: File | null = null;
  token: string = '';
  correo: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
      confirmarContrasenia: ['', [Validators.required]],
      preguntaseguridad1: ['', [Validators.required]],
      respuestaSeguridad1: ['', [Validators.required]],
      preguntaseguridad2: ['', [Validators.required]],
      respuestaSeguridad2: ['', [Validators.required]],
      preguntaseguridad3: ['', [Validators.required]],
      respuestaSeguridad3: ['', [Validators.required]],
      telefonoEmpleado: ['', [Validators.required]],
      numero_identificacion: ['', [Validators.required]]
    }, { validator: this.confirmarContrasenaValidator('contrasena', 'confirmarContrasenia') });

    this.preguntaSeguridad = [
      { pregunta: "¿Cuál es tu animal favorito?" },
      { pregunta: "¿Cuál es tu pasatiempo favorito?" },
      { pregunta: "¿En qué ciudad te gustaría vivir?" }
    ];
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (this.token) {
      const decodedToken: any = jwtDecode(this.token);
      this.correo = decodedToken.correo;
      this.form.patchValue({ correo: this.correo });
    } else {
      this.toastr.error('Token no encontrado', 'Error');
      this.router.navigate(['/']);
    }
  }

  confirmarContrasenaValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['confirmarContrasena']) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmarContrasena: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.archivo = event.target.files[0];
    }
  }

  enviarInformacionDeSeguridad() {
    if (this.form.valid && this.archivo) {
      const datos = {
        correo: this.form.value.correo,
        contrasena: this.form.value.contrasena,
        pregunta_de_usuario_1: this.form.value.preguntaseguridad1,
        respuesta_de_usuario_1: this.form.value.respuestaSeguridad1,
        pregunta_de_usuario_2: this.form.value.preguntaseguridad2,
        respuesta_de_usuario_2: this.form.value.respuestaSeguridad2,
        pregunta_de_usuario_3: this.form.value.preguntaseguridad3,
        respuesta_de_usuario_3: this.form.value.respuestaSeguridad3,
        telefonoEmpleado: this.form.value.telefonoEmpleado,
        numero_identificacion: this.form.value.numero_identificacion
      };

      this.authService.completarRegistro(this.token, datos, this.archivo).subscribe({
        next: () => {
          this.toastr.success('Registro completado con éxito', 'Éxito');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al completar el registro', 'Error');
        }
      });
    } else {
      this.toastr.error('Por favor, completa todos los campos y sube el archivo de identificación.', 'Error');
    }
  }
}
