import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from '../../../services/centro-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-centro-trabajo',
  templateUrl: './centro-trabajo.component.html',
  styleUrls: ['./centro-trabajo.component.scss']
})
export class CentroTrabajoComponent implements OnInit {
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  displayedColumns: string[] = [
    'nombre',
    'telefono_1',
    'telefono_2',
    'correo_1',
    'correo_2',
    'apoderado_legal',
    'representante_legal',
    'rtn',
    'logo',
    'editar'
  ];

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

  constructor(private fb: FormBuilder, private centroTrabajoService: CentroTrabajoService) {}

  ngOnInit() {
    this.obtenerCentrosTrabajo();
  }

  obtenerCentrosTrabajo() {
    this.centroTrabajoService.getCentrosTrabajo().subscribe(
      (data) => {
        this.dataSource.data = data.map((row: any) => ({
          nombre: row[2],
          telefono_1: row[3],
          telefono_2: row[4],
          correo_1: row[5],
          correo_2: row[6],
          apoderado_legal: row[7],
          representante_legal: row[8],
          rtn: row[9],
          logo: row[10],
        }));

        this.totalItems = this.dataSource.data.length;
      },
      (error) => {
        console.error('Error al obtener centros de trabajo:', error);
      }
    );
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  editarCentroTrabajo(centroTrabajo: any) {
    console.log('Editar centro de trabajo:', centroTrabajo);
    this.formulario.patchValue({
      nombre: centroTrabajo.nombre,
      ciudad: centroTrabajo.ciudad,
      correo_1: centroTrabajo.correo_1,
      correo_2: centroTrabajo.correo_2,
      telefono_1: centroTrabajo.telefono_1,
      telefono_2: centroTrabajo.telefono_2,
      apoderado_legal: centroTrabajo.apoderado_legal,
      representante_legal: centroTrabajo.representante_legal,
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


          // Aquí puedes manejar la respuesta del servidor después de agregar el centro de trabajo
          console.log('Centro de trabajo agregado correctamente:', response);
          // Luego, puedes recargar la lista de centros de trabajo si es necesario
          this.obtenerCentrosTrabajo();
          // También puedes limpiar el formulario
          this.limpiarCentroTrabajo();
        },
        (error) => {
          console.error('Error al agregar centro de trabajo:', error);
        }
      );
    }
  }
}
