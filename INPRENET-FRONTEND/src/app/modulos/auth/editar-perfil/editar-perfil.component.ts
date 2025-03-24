import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {
  perfilForm: FormGroup;
  contrasenaForm: FormGroup;
  correo!: string;
  archivoIdentificacion: File | null = null;
  archivoIdentificacionUrl: string | null = null;
  fotoEmpleado: File | null = null;
  fotoEmpleadoUrl: string | null = null;
  modulos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {
    this.perfilForm = this.fb.group({
      idEmpleado: [null],
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      puesto: ['', Validators.required],
      centroTrabajo: ['', Validators.required],
      telefono1: ['', Validators.required],
      telefono2: [''],
      numeroIdentificacion: ['', Validators.required]
    });

    this.contrasenaForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.correo = this.authService.obtenerCorreoDelToken()!;
    this.obtenerPerfil();
  }

  obtenerPerfil(): void {
    this.authService.obtenerPerfil(this.correo).subscribe({
      next: (perfil: any) => {
        const idEmpleado = perfil.empleadoCentroTrabajo.empleado.id_empleado; // Obtener el idEmpleado

        // Actualizar los valores del formulario, incluyendo idEmpleado
        this.perfilForm.patchValue({
          idEmpleado: idEmpleado, // Asegúrate de agregar este valor al formulario
          nombre: perfil.empleadoCentroTrabajo.empleado.nombreEmpleado,
          correo: perfil.empleadoCentroTrabajo.correo_1,
          puesto: perfil.empleadoCentroTrabajo.nombrePuesto,
          centroTrabajo: perfil.empleadoCentroTrabajo.centroTrabajo.nombre_centro_trabajo,
          telefono1: perfil.empleadoCentroTrabajo.empleado.telefono_1,
          telefono2: perfil.empleadoCentroTrabajo.empleado.telefono_2,
          numeroIdentificacion: perfil.empleadoCentroTrabajo.empleado.numero_identificacion
        });

        this.fotoEmpleadoUrl = perfil.empleadoCentroTrabajo.empleado.foto_empleado
          ? `data:image/png;base64,${this.arrayBufferToBase64(perfil.empleadoCentroTrabajo.empleado.foto_empleado.data)}`
          : null;

        this.archivoIdentificacionUrl = perfil.empleadoCentroTrabajo.empleado.archivo_identificacion
          ? `data:image/png;base64,${this.arrayBufferToBase64(perfil.empleadoCentroTrabajo.empleado.archivo_identificacion.data)}`
          : null;

        this.modulos = perfil.usuarioModulos.map((modulo: any) => modulo.rolModulo.modulo);
      },
      error: (err: any) => {
        this.snackBar.open('Error al obtener el perfil del usuario', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  onFileChange(event: any, tipoArchivo: string) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (tipoArchivo === 'archivoIdentificacion') {
        this.archivoIdentificacion = file;
        this.archivoIdentificacionUrl = URL.createObjectURL(file);
      } else if (tipoArchivo === 'fotoEmpleado') {
        this.fotoEmpleado = file;
        this.fotoEmpleadoUrl = URL.createObjectURL(file);
      }
    } else {
      this.toastr.error('Solo se permiten archivos de tipo imagen.', 'Error de archivo');
    }
  }

  editarArchivo(tipoArchivo: string): void {
    const input = document.getElementById(tipoArchivo) as HTMLInputElement;
    if (input) {
      input.accept = 'image/*';
      input.click();
    }
  }

  cambiarContrasena(): void {
    if (this.contrasenaForm.value.nuevaContrasena !== this.contrasenaForm.value.confirmarContrasena) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.authService.cambiarContrasena(this.correo, this.contrasenaForm.value.nuevaContrasena).subscribe({
      next: () => {
        this.snackBar.open('Contraseña cambiada con éxito', 'Cerrar', {
          duration: 3000,
        });
        this.contrasenaForm.reset();
      },
      error: (err: any) => {
        this.snackBar.open('Error al cambiar la contraseña', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  guardar() {
    if (this.perfilForm.valid) {
      const idEmpleado = this.perfilForm.value.idEmpleado;

      const formData: FormData = new FormData();
      formData.append('nombreEmpleado', this.perfilForm.value.nombre || '');
      formData.append('telefono_1', this.perfilForm.value.telefono1 || '');
      formData.append('telefono_2', this.perfilForm.value.telefono2 || '');
      formData.append('numero_identificacion', this.perfilForm.value.numeroIdentificacion || '');

      if (this.archivoIdentificacion) {
        formData.append('archivo_identificacion', this.archivoIdentificacion);
      }

      if (this.fotoEmpleado) {
        formData.append('foto_empleado', this.fotoEmpleado);
      }

      this.authService.actualizarEmpleado(idEmpleado, formData).subscribe({
        next: () => {
          this.toastr.success('Datos guardados con éxito', 'Éxito');
        },
        error: (err: any) => {
          this.toastr.error('Error al guardar los datos', 'Error');
          console.error(err);
        }
      });
    } else {
      this.toastr.error('Formulario inválido', 'Error');
    }
  }

}
