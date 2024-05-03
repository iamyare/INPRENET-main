import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';

@Component({
  selector: 'app-centro-trabajo',
  templateUrl: './centro-trabajo.component.html',
  styleUrls: ['./centro-trabajo.component.scss']
})
export class CentroTrabajoComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private centroTrabajoService: CentroTrabajoService
  ) {}

  //Arreglo donde se guardara los datos traidos de el servicio
  public informacion: any = [];

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    correo_1: ['', [Validators.required, Validators.email]],
    correo_2: ['', [Validators.required, Validators.email]],
    telefono_1: ['', [Validators.required, Validators.pattern("[0-9]*")]],
    telefono_2: ['', [Validators.required, Validators.pattern("[0-9]*")]],
    apoderado_legal: ['', [Validators.required]],
    representante_legal: ['', [Validators.required]],
  });

  ngOnInit() {
    this.obtenerCentrosTrabajo();
  }

  obtenerCentrosTrabajo() {
    this.centroTrabajoService.obtenerTodosLosCentrosTrabajo().subscribe(
      (res: any) => {
        if (res.ok) {
          this.informacion = res.centroTrabajo;
        }
      },
      (error) => {
        console.error('Error al obtener centros de trabajo:', error);
      }
    );
  }

  editarCentroTrabajo(centroTrabajo: any) {
    console.log('Editar centro de trabajo:', centroTrabajo);
    this.formulario.patchValue({
      nombre: centroTrabajo.NOMBRE,
      ciudad: 'Nada aun',
      telefono_1: centroTrabajo.TELEFONO_1,
      telefono_2: centroTrabajo.TELEFONO_2,
      correo_1: centroTrabajo.CORREO_1,
      correo_2: centroTrabajo.CORREO_2,
      apoderado_legal: centroTrabajo.APODERADO_LEGAL,
      representante_legal: centroTrabajo.REPRESENTANTE_LEGAL,
    });
  }

  limpiarCentroTrabajo() {
    this.formulario.reset();
  }

  agregarCentroTrabajo() {
    if (this.formulario.valid) {
      const nuevoCentro = this.formulario.value;
      this.centroTrabajoService.agregarCentroTrabajo(nuevoCentro).subscribe(
        (response) => {
          console.log('Centro de trabajo agregado correctamente:', response);
          this.obtenerCentrosTrabajo();
          this.limpiarCentroTrabajo();
        },
        (error) => {
          console.error('Error al agregar centro de trabajo:', error);
        }
      );
    }
  }
}
