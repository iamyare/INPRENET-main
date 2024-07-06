import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';

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
  rolesModulos: { rol: string, modulo: string }[] = [];
  adminRolesModulos: { rol: string, modulo: string }[] = [];
  selectedModulo: string = '';

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private toastr: ToastrService,
    private centrosTrabajoService: CentroTrabajoService
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(255), this.lowercaseValidator()]],
      modulo: ['', [Validators.required]],
      rol: ['', [Validators.required]],
      nombrePuesto: ['', [Validators.required, Validators.maxLength(255)]],
      nombreEmpleado: ['', [Validators.required, Validators.maxLength(255)]],
      numeroEmpleado: ['', [Validators.required, Validators.maxLength(255)]]
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

      this.rolesModulos = this.authSvc.getRolesModulos();
      this.adminRolesModulos = this.rolesModulos.filter(rm => rm.rol === 'ADMINISTRADOR');

      if (this.adminRolesModulos.length === 0) {
        console.error("No se encontraron módulos donde el usuario es administrador");
        return;
      }

      this.selectedModulo = this.adminRolesModulos[0].modulo;
      this.cargarRolesPorModulo(this.selectedModulo);
    }
  }

  onModuloChange(modulo: string): void {
    if (modulo) {
      this.selectedModulo = modulo;
      this.cargarRolesPorModulo(modulo);
    }
  }

  cargarRolesPorModulo(modulo: string) {
    this.authSvc.obtenerRolesPorModulo(modulo).subscribe({
      next: (roles) => {
        this.tipoRol = roles.map((rol: any) => ({
          label: rol.nombre,
          value: rol.id_rol_modulo
        }));
      },
      error: (err) => {
        console.error('Error al obtener roles:', err);
        this.toastr.error('Error al obtener roles', 'Error');
      }
    });
  }

  crearCuenta() {
    if (this.form.valid) {
      const formData = {
        correo: this.form.value.correo,
        idRole: Number(this.form.value.rol),
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

  private lowercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (value && value !== value.toLowerCase()) {
        return { lowercase: true };
      }
      return null;
    };
  }
}
