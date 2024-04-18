import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


  form: FormGroup;
  preguntaSeguridad: any = [];
  filteredLibraries: any = [];
  ocultaPregunta: boolean = false;
  ocultaPregunta2: boolean = false;
  loading: boolean = false;
  errorMsg: string = '';
  token: string | null = null;

  ConfirmarContrasenaValidator(controlName: string, matchingControlName: string) {
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


  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute) {
    this.form = this.fb.group({
      preguntaseguridad1: ['', [Validators.required]],
      preguntaseguridad2: ['', [Validators.required]],
      preguntaseguridad3: ['', [Validators.required]],
      respuestaSeguridad1: ['', [Validators.required]],
      respuestaSeguridad2: ['', [Validators.required]],
      respuestaSeguridad3: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      confirmarContrasenia: ['', Validators.required]
    }, { validator: this.ConfirmarContrasenaValidator('contrasenia', 'confirmarContrasenia') });

    this.preguntaSeguridad = [
      { "id": "preguntaseguridad1", "pregunta": "¿Cuál es tu animal favorito?" },
      { "id": "preguntaseguridad2", "pregunta": "¿Cuál es tu pasatiempo favorito?" },
      { "id": "preguntaseguridad3", "pregunta": "¿En qué ciudad te gustaría vivir?" }
    ];
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  prueba1(da: any) {
    this.ocultaPregunta = true;
    this.filteredLibraries = this.preguntaSeguridad.filter((item: any) =>
      item.id !== da.form.controls.preguntaseguridad1.value
    );
  }

  enviarInformacionDeSeguridad(): void {
    if (this.form.valid && this.token) {

      this.loading = true;
      const data = {
        token: this.token,
        contrasena: this.form.value.contrasenia,
        pregunta_de_usuario_1: this.form.value.preguntaseguridad1,
        respuesta_de_usuario_1: this.form.value.respuestaSeguridad1,
        pregunta_de_usuario_2: this.form.value.preguntaseguridad2,
        respuesta_de_usuario_2: this.form.value.respuestaSeguridad2,
        pregunta_de_usuario_3: this.form.value.preguntaseguridad3,
        respuesta_de_usuario_3: this.form.value.respuestaSeguridad3
      };

      this.authService.confirmarYActualizarSeguridad(data)
        .subscribe({
          next: (res) => {
            this.loading = true;
            window.location.href = 'http://localhost:4200/';
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Ocurrió un error al actualizar la información.';
            this.loading = false;
          }
        });
    } else {
      this.errorMsg = 'Por favor, completa todos los campos.';
    }
  }



}
