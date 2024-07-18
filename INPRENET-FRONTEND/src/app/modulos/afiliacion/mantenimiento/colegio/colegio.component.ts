import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { Validators } from '@angular/forms';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';

@Component({
  selector: 'app-colegio',
  templateUrl: './colegio.component.html',
  styleUrls: ['./colegio.component.scss']
})
export class ColegioComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'descripcion', 'acciones'];
  dataSource: any[] = [];

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadColegios();
  }

  loadColegios() {
    this.mantenimientoAfiliacionService.getAllColegios().subscribe(data => {
      this.dataSource = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '400px',
      data: {
        title: 'Colegio Magisterial',
        fields: [
          { name: 'descripcion', label: 'Descripción', type: 'text', validators: ['required'] }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createColegio(result).subscribe(() => {
          this.loadColegios();
        });
      }
    });
  }

  openDialogEditar(colegio: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'text', editable: true, validadores: [Validators.required] }
        ],
        valoresIniciales: colegio
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateColegio(colegio.id_colegio, result).subscribe(() => {
          this.loadColegios();
        });
      }
    });
  }
}
