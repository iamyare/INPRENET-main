import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profesion',
  templateUrl: './profesion.component.html',
  styleUrls: ['./profesion.component.scss']
})
export class ProfesionComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'descripcion', 'acciones'];
  myColumns = [
    { header: 'Descripción', col: 'descripcion' }
  ];
  dataSource: any[] = [];
  private executeFunction?: (data: any[]) => Promise<boolean>;

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProfesiones();
  }

  loadProfesiones() {
    this.mantenimientoAfiliacionService.getAllProfesiones().subscribe({
      next: (data) => {
        this.dataSource = data.map((item) => ({
          descripcion: item.descripcion,
          id_profesion: item.id_profesion
        }));

        // Ejecutar la función si fue asignada por el dynamic-table
        if (this.executeFunction) {
          this.executeFunction(this.dataSource);
        }
      },
      error: () => {
        this.toastr.error('Error al cargar las profesiones.', 'Error');
      }
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '600px',
      data: {
        title: 'Profesión',
        fields: [
          {
            name: 'descripcion',
            label: 'Descripción',
            type: 'text',
            validators: [
              'required',
              { name: 'minLength', args: [3] },
              { name: 'maxLength', args: [100] },
              { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9., ]+$/] } // Permite letras, números, puntos y comas
            ]
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createProfesion(result).subscribe({
          next: () => {
            this.loadProfesiones();
            this.toastr.success('Profesión agregada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo agregar la profesión.', 'Error');
          }
        });
      }
    });
  }

  openDialogEditar(profesion: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { 
            nombre: 'descripcion', 
            etiqueta: 'Descripción', 
            tipo: 'text', 
            editable: true, 
            validadores: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9., ]+$/)
            ] 
          }
        ],
        valoresIniciales: profesion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateProfesion(profesion.id_profesion, result).subscribe({
          next: () => {
            this.loadProfesiones();
            this.toastr.success('Profesión actualizada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar la profesión.', 'Error');
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
