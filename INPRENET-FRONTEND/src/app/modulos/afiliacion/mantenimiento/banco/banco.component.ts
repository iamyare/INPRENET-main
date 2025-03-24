import { Component, OnInit } from '@angular/core';
import { MantenimientoAfiliacionService } from 'src/app/services/mantenimiento-afiliacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogAgregarComponent } from 'src/app/components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-banco',
  templateUrl: './banco.component.html',
  styleUrls: ['./banco.component.scss']
})
export class BancoComponent implements OnInit {
  myColumns = [
    { header: 'Nombre del Banco', col: 'nombre_banco' },
    { header: 'Código ACH', col: 'codigo_ach' },
    { header: 'Estado', col: 'estado' }
  ];
  dataSource: any[] = [];
  private executeFunction?: (data: any[]) => Promise<boolean>;

  constructor(
    private mantenimientoAfiliacionService: MantenimientoAfiliacionService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBancos();
  }

  loadBancos() {
    this.mantenimientoAfiliacionService.getAllBancos().subscribe(data => {
      this.dataSource = data.map((item) => ({
        nombre_banco: item.nombre_banco,
        codigo_ach: item.codigo_ach,
        estado: item.estado || 'ACTIVO',
        id_banco: item.id_banco
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
          title: 'Banco',
          fields: [
            {
              name: 'nombre_banco',
              label: 'Nombre del Banco',
              type: 'text',
              validators: [
                'required',
                { name: 'minLength', args: [3] },
                { name: 'maxLength', args: [80] },
                { name: 'pattern', args: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/] }
              ]
            },
            {
              name: 'codigo_ach',
              label: 'Código ACH',
              type: 'text',
              validators: [
                'required',
                { name: 'minLength', args: [1] },
                { name: 'maxLength', args: [20] },
                { name: 'pattern', args: [/^[0-9]+$/] }
              ]
            }
          ]
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const newBanco = { ...result, estado: 'ACTIVO' };
          this.mantenimientoAfiliacionService.createBanco(newBanco).subscribe({
            next: () => {
              this.loadBancos();
              this.toastr.success('Banco agregado correctamente.', 'Éxito');
            },
            error: (err) => {
              if (err.status === 409) {
                this.toastr.error('El código ACH ya está en uso. Por favor, elige otro.', 'Error');
              } else {
                this.toastr.error('Ocurrió un error al crear el banco.', 'Error');
              }
            }
          });
        }
      });
  }


  openDialogEditar(banco: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '600px',
      data: {
        campos: [
          { 
            nombre: 'nombre_banco', 
            etiqueta: 'Nombre del Banco', 
            tipo: 'text', 
            editable: true, 
            validadores: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(80),
              Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/)
            ] 
          },
          { 
            nombre: 'codigo_ach', 
            etiqueta: 'Código ACH', 
            tipo: 'text', 
            editable: true, 
            validadores: [
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(20),
              Validators.pattern(/^[0-9]+$/)
            ] 
          },
          {
            nombre: 'estado',
            etiqueta: 'Estado',
            tipo: 'list',
            editable: true,
            opciones: [
              { label: 'ACTIVO', value: 'ACTIVO' },
              { label: 'INACTIVO', value: 'INACTIVO' }
            ]
          }
        ],
        valoresIniciales: banco
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mantenimientoAfiliacionService.updateBanco(banco.id_banco, result).subscribe({
          next: () => {
            this.loadBancos();
            this.toastr.success('Banco actualizado correctamente.', 'Éxito');
          },
          error: () => {
            this.toastr.error('No se pudo actualizar el banco.', 'Error');
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
