import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pre-register',
  templateUrl: './pre-register.component.html',
  styleUrls: ['./pre-register.component.scss']
})
export class PreRegisterComponent implements OnInit {
  form: FormGroup;
  tipoRol: any[] = [];
  idCentroTrabajo: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private toastr: ToastrService
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
        idRole: this.form.value.rol,
        nombrePuesto: this.form.value.nombrePuesto,
        nombreEmpleado: this.form.value.nombreEmpleado,
        numeroEmpleado: this.form.value.numeroEmpleado
      };

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
