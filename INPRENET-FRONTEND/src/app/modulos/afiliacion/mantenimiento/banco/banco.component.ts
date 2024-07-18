import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-banco',
  templateUrl: './banco.component.html',
  styleUrls: ['./banco.component.scss']
})
export class BancoComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'nombre_banco', 'cod_banco', 'acciones'];
  dataSource: any[] = [];

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBancos();
  }

  loadBancos() {
    this.mantenimientoAfiliacionService.getAllBancos().subscribe(data => {
      this.dataSource = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '400px',
      data: {
        title: 'Banco',
        fields: [
          { name: 'nombre_banco', label: 'Nombre del Banco', type: 'text', validators: ['required'] },
          { name: 'cod_banco', label: 'Código del Banco', type: 'text', validators: ['required'] }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createBanco(result).subscribe(() => {
          this.loadBancos();
        });
      }
    });
  }

  openDialogEditar(banco: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { nombre: 'nombre_banco', etiqueta: 'Nombre del Banco', tipo: 'text', editable: true, validadores: [Validators.required] },
          { nombre: 'cod_banco', etiqueta: 'Código del Banco', tipo: 'text', editable: true, validadores: [Validators.required] }
        ],
        valoresIniciales: banco
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateBanco(banco.id_banco, result).subscribe(() => {
          this.loadBancos();
        });
      }
    });
  }
}
