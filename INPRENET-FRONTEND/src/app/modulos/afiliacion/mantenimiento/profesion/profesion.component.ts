import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-profesion',
  templateUrl: './profesion.component.html',
  styleUrls: ['./profesion.component.scss']
})
export class ProfesionComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'descripcion', 'acciones'];
  dataSource: any[] = [];

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadProfesiones();
  }

  loadProfesiones() {
    this.mantenimientoAfiliacionService.getAllProfesiones().subscribe(data => {
      this.dataSource = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '400px',
      data: {
        title: 'Profesión',
        fields: [
          { name: 'descripcion', label: 'Descripción', type: 'text', validators: ['required'] }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createProfesion(result).subscribe(() => {
          this.loadProfesiones();
        });
      }
    });
  }

  openDialogEditar(profesion: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'text', editable: true, validadores: [Validators.required] }
        ],
        valoresIniciales: profesion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateProfesion(profesion.id_profesion, result).subscribe(() => {
          this.loadProfesiones();
        });
      }
    });
  }
}
