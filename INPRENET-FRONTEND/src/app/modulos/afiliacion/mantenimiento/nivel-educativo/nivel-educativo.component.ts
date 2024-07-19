import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-nivel-educativo',
  templateUrl: './nivel-educativo.component.html',
  styleUrls: ['./nivel-educativo.component.scss']
})
export class NivelEducativoComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'nombre', 'acciones'];
  dataSource: any[] = [];

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadNivelesEducativos();
  }

  loadNivelesEducativos() {
    this.mantenimientoAfiliacionService.getAllNivelesEducativos().subscribe(data => {
      this.dataSource = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '400px',
      data: {
        title: 'Nivel Educativo',
        fields: [
          { name: 'nombre', label: 'Nombre', type: 'text', validators: ['required'] }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createNivelEducativo(result).subscribe(() => {
          this.loadNivelesEducativos();
        });
      }
    });
  }

  openDialogEditar(nivel: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', editable: true, validadores: [Validators.required] }
        ],
        valoresIniciales: nivel
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateNivelEducativo(nivel.id_nivel, result).subscribe(() => {
          this.loadNivelesEducativos();
        });
      }
    });
  }
}
