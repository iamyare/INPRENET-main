import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DireccionService } from '../../../../services/direccion.service';
import { DynamicDialogAgregarComponent } from '../../../../components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { EditarDialogComponent } from '../../../../components/dinamicos/editar-dialog/editar-dialog.component';
import { AbstractControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-colonia',
  templateUrl: './colonia.component.html',
  styleUrls: ['./colonia.component.scss']
})
export class ColoniaComponent implements OnInit {
  dataSource: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  myColumns: TableColumn[] = [];
  colonias: any[] = [];
  private executeFunction?: (data: any[]) => Promise<boolean>;

  constructor(
    private direccionService: DireccionService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDepartamentos();
    this.myColumns = [
      { header: 'Colonia', col: 'nombre' },
      { header: 'Municipio', col: 'municipio' },
      { header: 'Departamento', col: 'departamento' },
      { header: 'Estado', col: 'estado' }
    ];
    this.loadColonias();
  }

  async loadColonias(): Promise<void> {
    try {
      const data = await this.direccionService.getColonias().toPromise();
      if (!data) {
        this.colonias = [];
        return;
      }

      this.colonias = data.map((c: any) => ({
        id_colonia: c.value,
        nombre: c.label,
        municipio: c.municipio || 'Sin municipio',
        departamento: c.departamento || 'Sin departamento',
        estado: c.estado || 'ACTIVO'
      }));

      if (this.executeFunction) {
        this.executeFunction(this.colonias);
      }
    } catch (error) {
      this.toastr.error('Error al cargar las colonias', 'Error');
      console.error('Error al obtener las colonias:', error);
    }
  }

  loadDepartamentos() {
    this.direccionService.getAllDepartments().subscribe(data => {
      this.departamentos = data;
    });
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(DynamicDialogAgregarComponent, {
      width: '600px',
      data: {
        title: 'Colonia',
        fields: [
          {
            name: 'departamento',
            label: 'Departamento',
            type: 'select',
            options: this.departamentos.map(d => ({
              value: d.id_departamento,
              label: d.nombre_departamento
            })),
            validators: ['required']
          },
          {
            name: 'municipio',
            label: 'Municipio',
            type: 'select',
            options: [],
            validators: ['required'],
            dependsOn: 'departamento'
          },
          {
            name: 'nombre',
            label: 'Nombre de la Colonia',
            type: 'text',
            validators: [
              'required',
              { name: 'minLength', args: [3] },
              { name: 'maxLength', args: [50] },
              { name: 'pattern', args: [/^[a-zA-ZÀ-ÿ\s]+$/] }
            ]
          }
        ]
      }
    });

    dialogRef.afterOpened().subscribe(() => {
      const departamentoControl = dialogRef.componentInstance.form.get('departamento');
      departamentoControl?.valueChanges.subscribe(departamentoId => {
        if (departamentoId) {
          this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).subscribe(municipios => {
            dialogRef.componentInstance.dynamicOptions['municipio'] = municipios.map(m => ({
              value: m.value,
              label: m.label
            }));
            dialogRef.componentInstance.form.get('municipio')?.setValue(null);
          });
        }
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.direccionService.crearColonia(result.nombre, result.municipio).subscribe(() => {
          this.loadColonias();
          this.toastr.success('Colonia agregada correctamente', 'Éxito');
        }, error => {
          this.toastr.error('No se pudo agregar la colonia', 'Error');
        });
      }
    });
  }

  manejarEditarColonia(colonia: any) {
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
              Validators.maxLength(50)
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
          },
          {
            nombre: 'observacion',
            etiqueta: 'Observación',
            tipo: 'text',
            editable: true,
            dependeDe: 'estado',
            valorDependiente: 'INACTIVO',
            validadores: []
          }
        ],
        valoresIniciales: {
          nombre: colonia.nombre,
          estado: colonia.estado ?? 'ACTIVO',
          observacion: colonia.observacion || ''
        },
        validacionesDinamicas: {
          observacion: [
            (control: AbstractControl) => {
              const estadoControl = dialogRef.componentInstance.formGroup.get('estado');
              return estadoControl?.value === 'INACTIVO' && !control.value
                ? { required: true }
                : null;
            }
          ]
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.direccionService
          .actualizarColonia(colonia.id_colonia, result.nombre, result.estado, result.observacion)
          .subscribe({
            next: () => {
              this.loadColonias();
              this.toastr.success(
                `Colonia ${result.estado === 'ACTIVO' ? 'activada' : 'actualizada'} correctamente`,
                'Éxito'
              );
            },
            error: () => {
              this.toastr.error('No se pudo actualizar la colonia', 'Error');
            }
          });
      }
    });
  }

  getData = async (): Promise<any[]> => {
    return this.colonias;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any[]) => Promise<boolean>) {
    this.executeFunction = funcion;
  }
}
