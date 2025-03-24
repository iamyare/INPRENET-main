import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-discapacidad',
  templateUrl: './discapacidad.component.html',
  styleUrls: ['./discapacidad.component.scss']
})
export class DiscapacidadComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'tipo_discapacidad', 'descripcion', 'acciones'];
  myColumns = [
    { header: 'Tipo de Discapacidad', col: 'tipo_discapacidad' },
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
    this.loadDiscapacidades();
  }

  loadDiscapacidades() {
    this.mantenimientoAfiliacionService.getAllDiscapacidades().subscribe({
      next: (data) => {
        this.dataSource = data.map((item) => ({
          tipo_discapacidad: item.tipo_discapacidad,
          descripcion: item.descripcion,
          id_discapacidad: item.id_discapacidad
        }));

        // Ejecutar la función si fue asignada por el dynamic-table
        if (this.executeFunction) {
          this.executeFunction(this.dataSource);
        }
      },
      error: () => {
        this.toastr.error('Error al cargar las discapacidades.', 'Error');
      }
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '600px',
      data: {
        title: 'Discapacidad',
        fields: [
          {
            name: 'tipo_discapacidad',
            label: 'Tipo de Discapacidad',
            type: 'text',
            validators: [
              'required',
              { name: 'minLength', args: [3] },
              { name: 'maxLength', args: [50] },
              { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/] } // Solo letras y espacios
            ]
          },
          {
            name: 'descripcion',
            label: 'Descripción',
            type: 'text',
            validators: [
              { name: 'maxLength', args: [200] },
              { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9., ]*$/] } // Permite letras, números, puntos y comas
            ]
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.createDiscapacidad(result).subscribe({
          next: () => {
            this.loadDiscapacidades();
            this.toastr.success('Discapacidad agregada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo agregar la discapacidad.', 'Error');
          }
        });
      }
    });
}


  openDialogEditar(discapacidad: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '400px',
      data: {
        campos: [
          { 
            nombre: 'tipo_discapacidad', 
            etiqueta: 'Tipo de Discapacidad', 
            tipo: 'text', 
            editable: true, 
            validadores: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(50),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/)
            ] 
          },
          { 
            nombre: 'descripcion', 
            etiqueta: 'Descripción', 
            tipo: 'text', 
            editable: true, 
            validadores: [
              Validators.maxLength(200), 
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9., ]*$/)
            ] 
          }
        ],
        valoresIniciales: discapacidad
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateDiscapacidad(discapacidad.id_discapacidad, result).subscribe({
          next: () => {
            this.loadDiscapacidades();
            this.toastr.success('Discapacidad actualizada correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar la discapacidad.', 'Error');
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
