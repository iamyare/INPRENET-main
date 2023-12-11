import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from '../../../services/centro-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-centro-trabajo',
  templateUrl: './centro-trabajo.component.html',
  styleUrls: ['./centro-trabajo.component.scss']
})
export class CentroTrabajoComponent implements OnInit {

  nombreBusqueda: string = '';
  public informacion: any = [];

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);

  pageSize = 5;
  desde = 0;
  hasta: number = this.pageSize;

  displayedColumns: string[] = [
    'indice',
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

  @ViewChild(MatPaginator) matPaginator: MatPaginator | undefined;

  constructor(
    private fb: FormBuilder,
    private centroTrabajoService: CentroTrabajoService
  ) {}

  ngOnInit() {
    this.obtenerCentrosTrabajo();
  }

  obtenerCentrosTrabajo() {
    this.centroTrabajoService.getCentrosTrabajo().subscribe(
      async (res: any) => {
        if (res.ok) {
          this.informacion = res.centrosTrabajo;
          this.dataSource.data = this.informacion; // Actualiza el dataSource
          this.actualizarPaginador();
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
      nombre: centroTrabajo[2],
      ciudad: 'Nada aun',
      telefono_1: centroTrabajo[3],
      telefono_2: centroTrabajo[4],
      correo_1: centroTrabajo[5],
      correo_2: centroTrabajo[6],
      apoderado_legal: centroTrabajo[7],
      representante_legal: centroTrabajo[8],
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

  buscarPorNombre() {
    if (this.nombreBusqueda.trim() === '') {
      this.dataSource.filter = '';
    } else {
      this.aplicarFiltroNombre();
    }
  }

  aplicarFiltroNombre() {
    this.dataSource.filter = this.nombreBusqueda.trim().toLowerCase();
  }

  onPageChange(e: PageEvent): void {
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;

    const paginatedData = this.informacion.slice(this.desde, this.hasta);
    this.dataSource.data = paginatedData;

    if (this.nombreBusqueda.trim() !== '') {
      this.aplicarFiltroNombre();
    }
  }

  private actualizarPaginador() {
    this.pageSize = 5; // Ajusta según tu necesidad
    this.hasta = this.pageSize;

    if (this.matPaginator) {
      this.matPaginator.length = this.informacion.length;
    }
  }
}
