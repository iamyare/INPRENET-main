import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-discapacidad',
  templateUrl: './discapacidad.component.html',
  styleUrls: ['./discapacidad.component.scss']
})
export class DiscapacidadComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'tipo_discapacidad', 'descripcion', 'acciones'];
  dataSource: any[] = [];

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDiscapacidades();
  }

  loadDiscapacidades() {
    this.mantenimientoAfiliacionService.getAllDiscapacidades().subscribe(data => {
      this.dataSource = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '400px',
      data: {
        title: 'Discapacidad',
        fields: [
          { name: 'tipo_discapacidad', label: 'Tipo de Discapacidad', type: 'text', validators: ['required'] },
          { name: 'descripcion', label: 'Descripción', type: 'text' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createDiscapacidad(result).subscribe(() => {
          this.loadDiscapacidades();
        });
      }
    });
  }

  openDialogEditar(discapacidad: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { nombre: 'tipo_discapacidad', etiqueta: 'Tipo de Discapacidad', tipo: 'text', editable: true, validadores: [Validators.required] },
          { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'text', editable: true }
        ],
        valoresIniciales: discapacidad
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateDiscapacidad(discapacidad.id_discapacidad, result).subscribe(() => {
          this.loadDiscapacidades();
        });
      }
    });
  }
}
