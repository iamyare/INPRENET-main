import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-jornada',
  templateUrl: './jornada.component.html',
  styleUrls: ['./jornada.component.scss']
})
export class JornadaComponent implements OnInit {
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
    this.loadJornadas();
  }

  loadJornadas() {
    this.mantenimientoAfiliacionService.getAllJornadas().subscribe(data => {
      this.dataSource = data.map((item) => ({
        nombre: item.nombre,
        id_jornada: item.id_jornada
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
        title: 'Jornada',
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
        this.mantenimientoAfiliacionService.createJornada(result).subscribe({
          next: () => {
            this.loadJornadas();
            this.toastr.success('Jornada agregada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo agregar la jornada.', 'Error');
          }
        });
      }
    });
  }

  openDialogEditar(jornada: any): void {
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
        valoresIniciales: jornada
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateJornada(jornada.id_jornada, result).subscribe({
          next: () => {
            this.loadJornadas();
            this.toastr.success('Jornada actualizada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar la jornada.', 'Error');
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
