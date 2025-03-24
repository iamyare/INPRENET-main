import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { Validators } from '@angular/forms';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-colegio',
  templateUrl: './colegio.component.html',
  styleUrls: ['./colegio.component.scss']
})
export class ColegioComponent implements OnInit {
  myColumns = [
    { header: 'Siglas', col: 'abreviatura' },
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
    this.loadColegios();
  }

  loadColegios() {
    this.mantenimientoAfiliacionService.getAllColegios().subscribe({
      next: (data) => {
        this.dataSource = data.map((item) => ({
          abreviatura: item.abreviatura,
          descripcion: item.descripcion,
          id_colegio: item.id_colegio
        }));

        if (this.executeFunction) {
          this.executeFunction(this.dataSource);
        }
      },
      error: () => {
        this.toastr.error('Error al cargar los colegios magisteriales.', 'Error');
      }
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '600px',
      data: {
        title: 'Colegio Magisterial',
        fields: [
          {
            name: 'abreviatura',
            label: 'Siglas',
            type: 'text',
            validators: [
              'required',
              { name: 'minLength', args: [2] },
              { name: 'maxLength', args: [10] },
              { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+$/] } // Solo letras sin espacios
            ]
          },
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
        this.mantenimientoAfiliacionService.createColegio(result).subscribe({
          next: () => {
            this.loadColegios();
            this.toastr.success('Colegio magisterial agregado correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo agregar el colegio magisterial.', 'Error');
          }
        });
      }
    });
}

  openDialogEditar(colegio: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          {
            nombre: 'abreviatura',
            etiqueta: 'Siglas',
            tipo: 'text',
            editable: true,
            validadores: [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(10),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+$/) // Solo letras sin espacios
            ]
          },
          {
            nombre: 'descripcion',
            etiqueta: 'Descripción',
            tipo: 'text',
            editable: true,
            validadores: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9., ]+$/) // Permite letras, números, puntos y comas
            ]
          }
        ],
        valoresIniciales: colegio
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateColegio(colegio.id_colegio, result).subscribe({
          next: () => {
            this.loadColegios();
            this.toastr.success('Colegio magisterial actualizado correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar el colegio magisterial.', 'Error');
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
