import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DisableUserDialogComponent } from '../disable-user-dialog/disable-user-dialog.component';

@Component({
  selector: 'app-perfil-edicion',
  templateUrl: './perfil-edicion.component.html',
  styleUrls: ['./perfil-edicion.component.scss']
})
export class PerfilEdicionComponent implements OnInit {
  userId: string;
  usuario: any;
  perfilForm: FormGroup;
  estados = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'SUSPENDIDO']; // Lista de estados
  archivoIdentificacion: File | null = null;
  fotoEmpleado: File | null = null;
  fotoEmpleadoUrl: string | null = null; // Para almacenar la URL de la imagen

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private centroTrabajoService: CentroTrabajoService
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
    console.log('ID del usuario:', this.usuario);
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

      // Convertir la foto del empleado de base64 a URL
      this.fotoEmpleadoUrl = this.usuario.empleadoCentroTrabajo.empleado.foto_empleado
        ? `data:image/png;base64,${this.usuario.empleadoCentroTrabajo.empleado.foto_empleado}`
        : null;

      this.perfilForm.get('fecha_verificacion')?.disable();
      this.perfilForm.get('fecha_modificacion')?.disable();
      this.perfilForm.get('fecha_creacion')?.disable();
    }
  }

  onFileChange(event: any, tipoArchivo: string) {
    if (event.target.files.length > 0) {
      if (tipoArchivo === 'archivoIdentificacion') {
        this.archivoIdentificacion = event.target.files[0];
      } else if (tipoArchivo === 'fotoEmpleado') {
        this.fotoEmpleado = event.target.files[0];
        if (this.fotoEmpleado) {
          this.fotoEmpleadoUrl = URL.createObjectURL(this.fotoEmpleado);
        } else {
          this.fotoEmpleadoUrl = null;
        }
      }
    }
  }

  guardar() {
    if (this.perfilForm.valid) {
      const datos = {
        nombreEmpleado: this.perfilForm.value.nombre,
        correo: this.perfilForm.value.correo,
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
          console.log('Datos guardados:', response);
        },
        error: (err) => {
          console.log('Error al guardar los datos:', err);
        }
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  abrirDialogoDeshabilitar() {
    const dialogRef = this.dialog.open(DisableUserDialogComponent, {
      width: '300px',
      data: { userId: this.userId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Resultado del diálogo:', result);
        // Aquí puedes manejar la lógica para deshabilitar el usuario
      }
    });
  }
}
