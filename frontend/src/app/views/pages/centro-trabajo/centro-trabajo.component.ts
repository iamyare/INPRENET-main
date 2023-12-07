// centro-trabajo.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private centroTrabajoService: CentroTrabajoService) {}

  ngOnInit() {
    this.obtenerCentrosTrabajo();
  }

  obtenerCentrosTrabajo() {
    this.centroTrabajoService.getCentrosTrabajo().subscribe(
      (data) => {
        this.dataSource.data = data.map((row: any) => ({
          nombre: row[2],
          telefono1: row[4],
          telefono2: row[5],
          correo1: row[6],
          correo2: row[7],
          apoderadoLegal: row[8],
          representanteLegal: row[9],
          rtn: row[10],
          logo: row[11],
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
  }
}
