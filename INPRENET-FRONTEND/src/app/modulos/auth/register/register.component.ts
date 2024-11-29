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
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      contrasena: ['', [
        Validators.required,
      ]],
      confirmarContrasenia: ['', [Validators.required]],
      telefonoEmpleado: ['', [Validators.required]],
      telefonoEmpleado2: [''],
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

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
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
    return this.form.valid;
  }

  enviarInformacionDeSeguridad() {
    if (this.form.valid) {
      const datos = {
        correo: this.form.get('correo')!.value,
        contrasena: this.form.get('contrasena')!.value,
        telefonoEmpleado: this.form.get('telefonoEmpleado')!.value,
        telefonoEmpleado2: this.form.get('telefonoEmpleado2')!.value,
        numero_identificacion: this.form.get('numero_identificacion')!.value
      };

      this.authService.completarRegistro(
        this.token,
        datos,
        this.archivo ?? undefined,
        this.fotografia ?? undefined
      ).subscribe({
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
      this.toastr.error('Por favor, completa todos los campos requeridos.', 'Error');
    }
  }
}
