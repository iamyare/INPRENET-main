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
  centrosTrabajo: any[] = [];
  modulos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private datosEstaticosService: DatosEstaticosService,
    private authService : AuthService,
  ) {
    this.userForm = this.fb.group({
      nombreEmpleado: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      numeroEmpleado: ['', Validators.required],
      idRole: ['', Validators.required],
      centroTrabajo: ['', Validators.required],
      modulo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.datosEstaticosService.getAllCentrosTrabajo().then(() => {
      this.centrosTrabajo = this.datosEstaticosService.centrosTrabajo;
    });
  }

  onCentroTrabajoChange(event: any): void {
    const idCentroTrabajo = event.value;
    this.authService.obtenerModulosPorCentroTrabajo(idCentroTrabajo).subscribe((modulos) => {
      this.modulos = modulos.map(modulo => ({
        label: modulo.nombre,
        value: modulo.id_modulo,
      }));
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      console.log('Nuevo usuario:', newUser);
      this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
        duration: 3000
      });
      this.userForm.reset();
    } else {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }
}
