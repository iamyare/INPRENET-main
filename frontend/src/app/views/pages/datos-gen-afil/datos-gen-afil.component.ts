import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AfiliadoService } from '../../../services/afiliado.service';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-datos-gen-afil',
  templateUrl: './datos-gen-afil.component.html',
  styleUrls: ['./datos-gen-afil.component.scss']
})
export class DatosGenAfilComponent implements OnInit {
  @ViewChild(MatPaginator) matPaginator: MatPaginator | undefined;

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);

  public informacion: any = [];
  nombreBusqueda: string = '';

  pageSize = 5;
  desde = 0;
  hasta: number = this.pageSize;

  displayedColumns: string[] = [
  'ID_AFILIADO',
];


constructor(private afiliadoService: AfiliadoService) {}

ngOnInit(): void {
  this.obtenerAfiliados();
}

obtenerAfiliados() {
  this.afiliadoService.getAllAfiliados().subscribe(
    (res: any) => {
      if (res.ok) {
        this.informacion = res.afiliados;
        this.dataSource.data = this.informacion.slice(0, this.pageSize);
        this.actualizarPaginador();
      }
    },
    (error) => {
      console.error('Error al obtener afiliados', error);
    }
    );
  }

  @Input() dataEntrante: any;
  editarCentroTrabajo(centroTrabajo: any) {
    this.dataEntrante = centroTrabajo;
    console.log(this.dataEntrante);

    this.afiliadoService.afiliadosEdit.emit({
      data: this.dataEntrante
    });
  }

  aplicarFiltroNombre() {
    this.dataSource.filter = this.nombreBusqueda.trim().toLowerCase();
  }

  onPageChange(e: PageEvent): void {
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;
    this.dataSource.data = this.informacion.slice(this.desde, this.hasta);
  }

  private actualizarPaginador() {
    if (this.matPaginator) {
      this.matPaginator.length = this.informacion.length;
      this.matPaginator.pageSize = this.pageSize;
    }
  }
}
