import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAdminComponent implements OnInit {
  userForm: FormGroup;
  centrosTrabajoTipoE: any[] = [];
  modulos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private datosEstaticosService: DatosEstaticosService,
    private authService: AuthService,
  ) {
    this.userForm = this.fb.group({
      nombreEmpleado: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      numeroEmpleado: ['', Validators.required],
      centroTrabajo: ['', Validators.required],
      modulo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.datosEstaticosService.getCentrosTrabajoTipoE().then(() => {
      this.centrosTrabajoTipoE = this.datosEstaticosService.centrosTrabajoTipoE;
    });
  }

  onCentroTrabajoChange(event: any): void {
    const idCentroTrabajo = event.value;
    console.log(idCentroTrabajo);

    this.authService.obtenerModulosPorCentroTrabajo(idCentroTrabajo).subscribe((modulos) => {
      this.modulos = modulos.map(modulo => ({
        label: modulo.nombre,
        value: modulo.id_modulo,
      }));
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const { nombreEmpleado, nombrePuesto, correo, numeroEmpleado, centroTrabajo, modulo } = this.userForm.value;
      const newUser = {
        nombreEmpleado,
        nombrePuesto,
        correo,
        numeroEmpleado,
        idModulo: modulo,
      };

      console.log(newUser);


      this.authService.preRegistroAdmin(newUser).subscribe(
        () => {
          this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.userForm.reset();
        },
        error => {
          console.error('Error al crear usuario:', error);
          this.snackBar.open('Error al crear usuario', 'Cerrar', {
            duration: 3000
          });
        }
      );
    } else {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }
}
