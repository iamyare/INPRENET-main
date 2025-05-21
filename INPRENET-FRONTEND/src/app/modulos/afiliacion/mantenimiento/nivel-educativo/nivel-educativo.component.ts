import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nivel-educativo',
  templateUrl: './nivel-educativo.component.html',
  styleUrls: ['./nivel-educativo.component.scss']
})
export class NivelEducativoComponent implements OnInit {
  myColumns = [
    { header: 'Nombre', col: 'nombre' }
  ];
  dataSource: any[] = [];
  private executeFunction?: (data: any[]) => Promise<boolean>;

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadNivelesEducativos();
  }

  loadNivelesEducativos() {
    this.mantenimientoAfiliacionService.getAllNivelesEducativos().subscribe(data => {
      this.dataSource = data.map((item) => ({
        nombre: item.nombre,
        id_nivel: item.id_nivel
      }));

      if (this.executeFunction) {
        this.executeFunction(this.dataSource);
      }
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '600px',
      data: {
        title: 'Nivel Educativo',
        fields: [
          {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            validators: [
              'required',
              { name: 'minLength', args: [3] },
              { name: 'maxLength', args: [50] },
              { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/] } // Solo letras y espacios
            ]
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createNivelEducativo(result).subscribe({
          next: () => {
            this.loadNivelesEducativos();
            this.toastr.success('Nivel educativo agregado correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo agregar el nivel educativo.', 'Error');
          }
        });
      }
    });
  }

  openDialogEditar(nivel: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          {
            nombre: 'nombre',
            etiqueta: 'Nombre',
            tipo: 'text',
            editable: true,
            validadores: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(50),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/) // Solo letras y espacios
            ]
          }
        ],
        valoresIniciales: nivel
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateNivelEducativo(nivel.id_nivel, result).subscribe({
          next: () => {
            this.loadNivelesEducativos();
            this.toastr.success('Nivel educativo actualizado correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar el nivel educativo.', 'Error');
          }
        });
      }
    });
  }

  getData = async (): Promise<any[]> => {
    return this.dataSource;
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any[]) => Promise<boolean>) {
    this.executeFunction = funcion;
  }
}
