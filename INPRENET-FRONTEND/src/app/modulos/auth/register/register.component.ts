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
  archivo: File | null = null;
  fotografia: File | null = null;
  token: string = '';
  correo: string = '';
  availableQuestions: string[] = [
    "¿Cuál es tu animal favorito?",
    "¿Cuál es tu pasatiempo favorito?",
    "¿En qué ciudad te gustaría vivir?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál fue el nombre de tu primera mascota?",
    "¿Cuál es tu libro favorito?"
  ];

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
      telefonoEmpleado2: [''], // Nuevo campo para el segundo teléfono
      numero_identificacion: ['', [Validators.required]]
    }, { validator: this.confirmarContrasenaValidator('contrasena', 'confirmarContrasenia') });
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

    // Suscribirse a los cambios en las preguntas de seguridad
    this.form.get('preguntaseguridad1')!.valueChanges.subscribe(() => this.updateQuestions());
    this.form.get('preguntaseguridad2')!.valueChanges.subscribe(() => this.updateQuestions());
    this.form.get('preguntaseguridad3')!.valueChanges.subscribe(() => this.updateQuestions());
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

  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'archivo') {
        this.archivo = file;
      } else if (type === 'fotografia') {
        this.fotografia = file;
      }
    } else {
      this.toastr.error('Solo se permiten archivos de tipo imagen.', 'Error de archivo');
    }
  }

  isFormComplete(): boolean {
    return this.form.valid && this.archivo !== null && this.fotografia !== null;
  }

  getAvailableQuestions(currentIndex: number): string[] {
    const selectedQuestions = [
      this.form.get('preguntaseguridad1')!.value,
      this.form.get('preguntaseguridad2')!.value,
      this.form.get('preguntaseguridad3')!.value
    ];
    return this.availableQuestions.filter(question => !selectedQuestions.includes(question) || selectedQuestions[currentIndex] === question);
  }

  updateQuestions() {
    this.form.get('preguntaseguridad1')!.updateValueAndValidity({ emitEvent: false });
    this.form.get('preguntaseguridad2')!.updateValueAndValidity({ emitEvent: false });
    this.form.get('preguntaseguridad3')!.updateValueAndValidity({ emitEvent: false });
  }

  enviarInformacionDeSeguridad() {
    if (this.isFormComplete()) {
      const datos = {
        correo: this.form.get('correo')!.value,
        contrasena: this.form.get('contrasena')!.value,
        pregunta_de_usuario_1: this.form.get('preguntaseguridad1')!.value,
        respuesta_de_usuario_1: this.form.get('respuestaSeguridad1')!.value,
        pregunta_de_usuario_2: this.form.get('preguntaseguridad2')!.value,
        respuesta_de_usuario_2: this.form.get('respuestaSeguridad2')!.value,
        pregunta_de_usuario_3: this.form.get('preguntaseguridad3')!.value,
        respuesta_de_usuario_3: this.form.get('respuestaSeguridad3')!.value,
        telefonoEmpleado: this.form.get('telefonoEmpleado')!.value,
        telefonoEmpleado2: this.form.get('telefonoEmpleado2')!.value, // Nuevo campo
        numero_identificacion: this.form.get('numero_identificacion')!.value
      };

      this.authService.completarRegistro(this.token, datos, this.archivo!, this.fotografia!).subscribe({
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
      this.toastr.error('Por favor, completa todos los campos y sube los archivos requeridos.', 'Error');
    }
  }

}
