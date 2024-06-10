import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CentrosTrabajoService } from 'src/app/services/centros-trabajo.service';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.scss']
})
export class NuevoUsuarioComponent implements OnInit {
  form: FormGroup;
  tipoRol: any[] = [];
  idCentroTrabajo: number | null = null;
  nombreCentroTrabajo: string = '';

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private toastr: ToastrService,
    private centrosTrabajoService: CentrosTrabajoService
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
      nombrePuesto: ['', [Validators.required]],
      nombreEmpleado: ['', [Validators.required]],
      numeroEmpleado: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.idCentroTrabajo = this.authSvc.getIdEmpresaFromToken();
    if (this.idCentroTrabajo) {
      this.centrosTrabajoService.getCentroTrabajoById(this.idCentroTrabajo).subscribe({
        next: (data) => {
          this.nombreCentroTrabajo = data.nombre_centro_trabajo;
        },
        error: (err) => {
          console.error('Error al obtener el nombre del centro de trabajo:', err);
        }
      });

      this.authSvc.getRolesByEmpresa(this.idCentroTrabajo).subscribe({
        next: (roles) => {
          this.tipoRol = roles.map((rol: any) => ({
            label: rol.nombre,
            value: rol.id_rol_empresa
          }));
        },
        error: (err) => {
          console.error('Error al obtener roles:', err);
          this.toastr.error('Error al obtener roles', 'Error');
        }
      });
    }
  }

  crearCuenta() {
    if (this.form.valid) {
      const formData = {
        correo: this.form.value.correo,
        idRole: Number(this.form.value.rol), // Convertir el rol a número
        nombrePuesto: this.form.value.nombrePuesto,
        nombreEmpleado: this.form.value.nombreEmpleado,
        numeroEmpleado: this.form.value.numeroEmpleado
      };

      console.log(formData);

      this.authSvc.preRegistro(formData).subscribe({
        next: () => {
          this.toastr.success('Cuenta creada exitosamente!', 'Éxito');
          this.form.reset();
        },
        error: (err) => {
          this.toastr.error('Error al crear la cuenta', 'Error');
          console.error('Error al crear la cuenta:', err);
        }
      });
    } else {
      console.error('El formulario no es válido');
      this.toastr.error('El formulario no es válido', 'Error');
    }
  }
}
