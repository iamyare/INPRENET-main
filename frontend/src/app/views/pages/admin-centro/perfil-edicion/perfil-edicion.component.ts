import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { AuthService } from 'src/app/services/auth.service';
import { DisableUserDialogComponent } from '../disable-user-dialog/disable-user-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil-edicion',
  templateUrl: './perfil-edicion.component.html',
  styleUrls: ['./perfil-edicion.component.scss']
})
export class PerfilEdicionComponent implements OnInit {
  userId: string;
  usuario: any;
  perfilForm: FormGroup;
  estados = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'SUSPENDIDO'];
  archivoIdentificacion: File | null = null;
  archivoIdentificacionUrl: string | null = null;
  fotoEmpleado: File | null = null;
  fotoEmpleadoUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private centroTrabajoService: CentroTrabajoService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    const navigation = this.router.getCurrentNavigation();
    this.usuario = navigation?.extras?.state?.['usuario'];
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      estado: ['', Validators.required],
      puesto: ['', Validators.required],
      fecha_verificacion: [''],
      fecha_modificacion: [''],
      fecha_creacion: [''],
      telefono_1: [''],
      telefono_2: [''],
      numero_identificacion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    if (this.usuario) {
      this.perfilForm.setValue({
        nombre: this.usuario.empleadoCentroTrabajo.empleado.nombreEmpleado || 'N/A',
        correo: this.usuario.empleadoCentroTrabajo.correo_1 || 'N/A',
        estado: this.usuario.estado || 'N/A',
        puesto: this.usuario.empleadoCentroTrabajo.nombrePuesto || 'N/A',
        fecha_verificacion: this.usuario.fecha_verificacion || 'N/A',
        fecha_modificacion: this.usuario.fecha_modificacion || 'N/A',
        fecha_creacion: this.usuario.fecha_creacion || 'N/A',
        telefono_1: this.usuario.empleadoCentroTrabajo.empleado.telefono_1 || 'N/A',
        telefono_2: this.usuario.empleadoCentroTrabajo.empleado.telefono_2 || 'N/A',
        numero_identificacion: this.usuario.empleadoCentroTrabajo.empleado.numero_identificacion || 'N/A'
      });

      // Convertir las imágenes de base64 a URL
      this.fotoEmpleadoUrl = this.usuario.empleadoCentroTrabajo.empleado.foto_empleado
        ? `data:image/png;base64,${this.usuario.empleadoCentroTrabajo.empleado.foto_empleado}`
        : null;

      this.archivoIdentificacionUrl = this.usuario.empleadoCentroTrabajo.empleado.archivo_identificacion
        ? `data:image/png;base64,${this.usuario.empleadoCentroTrabajo.empleado.archivo_identificacion}`
        : null;

      this.perfilForm.get('fecha_verificacion')?.disable();
      this.perfilForm.get('fecha_modificacion')?.disable();
      this.perfilForm.get('fecha_creacion')?.disable();
    }
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

  guardar() {
    if (this.perfilForm.valid) {
      const datos = {
        nombreEmpleado: this.perfilForm.value.nombre,
        correo_1: this.perfilForm.value.correo,
        estado: this.perfilForm.value.estado,
        nombrePuesto: this.perfilForm.value.puesto,
        telefono_1: this.perfilForm.value.telefono_1,
        telefono_2: this.perfilForm.value.telefono_2,
        numero_identificacion: this.perfilForm.value.numero_identificacion
      };

      const archivos: { archivoIdentificacion?: File, fotoEmpleado?: File } = {};

      if (this.archivoIdentificacion) {
        archivos.archivoIdentificacion = this.archivoIdentificacion;
      }
      if (this.fotoEmpleado) {
        archivos.fotoEmpleado = this.fotoEmpleado;
      }

      this.centroTrabajoService.actualizarEmpleado(parseInt(this.userId), datos, archivos).subscribe({
        next: (response) => {
          this.toastr.success('Datos guardados con éxito', 'Éxito');
        },
        error: (err) => {
          this.toastr.error('Error al guardar los datos', 'Error');
        }
      });
    } else {
      this.toastr.error('Formulario inválido', 'Error');
    }
  }

  abrirDialogoDeshabilitar() {
    const dialogRef = this.dialog.open(DisableUserDialogComponent, {
      width: '300px',
      data: { userId: this.userId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { disablePeriod, indefinite } = result;
        const fechaReactivacion = indefinite ? null : this.calcularFechaReactivacion(disablePeriod);
        this.desactivarUsuario(fechaReactivacion);
      }
    });
  }

  calcularFechaReactivacion(dias: number): Date {
    const fechaReactivacion = new Date();
    fechaReactivacion.setDate(fechaReactivacion.getDate() + dias);
    return fechaReactivacion;
  }

  desactivarUsuario(fechaReactivacion: Date | null) {
    this.authService.desactivarUsuario(parseInt(this.userId), fechaReactivacion).subscribe({
      next: response => {
        this.toastr.success(response.message, 'Usuario Desactivado');
        this.router.navigate(['/usuarios']);
      },
      error: err => {
        console.error('Error desactivando usuario', err);
        this.toastr.error('Error desactivando usuario', 'Error');
      }
    });
  }

  reactivarUsuario() {
    this.authService.reactivarUsuario(parseInt(this.userId)).subscribe({
      next: response => {
        this.toastr.success(response.message, 'Usuario Reactivado');
        this.router.navigate(['/usuarios']);
      },
      error: err => {
        console.error('Error reactivando usuario', err);
        this.toastr.error('Error reactivando usuario', 'Error');
      }
    });
  }
}
