import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    'telefono1',
    'telefono2',
    'correo1',
    'correo2',
    'apoderadoLegal',
    'representanteLegal',
    'rtn',
    'logo',
    'editar'
  ];

  formulario: FormGroup = this.fb.group({
    nombre: [''],
    ciudad: [''],
    correo1: [''],
    correo2: [''],
    telefono1: [''],
    telefono2: [''],
    apoderadoLegal: [''],
    representanteLegal: [''],
  });

  constructor(private fb: FormBuilder, private centroTrabajoService: CentroTrabajoService) {}

  ngOnInit() {
    this.obtenerCentrosTrabajo();
  }

  obtenerCentrosTrabajo() {
    this.centroTrabajoService.getCentrosTrabajo().subscribe(
      (data) => {
        console.log(this.dataSource.data);

        this.dataSource.data = data.map((row: any) => ({
          nombre: row[2],
          telefono1: row[3],
          telefono2: row[4],
          correo1: row[5],
          correo2: row[6],
          apoderadoLegal: row[7],
          representanteLegal: row[8],
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

    // Asigna los valores a los campos del formulario
    this.formulario.patchValue({
      nombre: centroTrabajo.nombre,
      ciudad: centroTrabajo.ciudad,
      correo1: centroTrabajo.correo1,
      correo2: centroTrabajo.correo2,
      telefono1: centroTrabajo.telefono1,
      telefono2: centroTrabajo.telefono2,
      apoderadoLegal: centroTrabajo.apoderadoLegal,
      representanteLegal: centroTrabajo.representanteLegal,
    });
  }

  limpiarCentroTrabajo(){
    this.formulario.reset()
  }
}
