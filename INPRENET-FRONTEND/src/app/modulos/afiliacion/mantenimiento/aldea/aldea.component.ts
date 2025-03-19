import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DireccionService } from '../../../../services/direccion.service';
import { DynamicDialogAgregarComponent } from '../../../../components/dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { EditarDialogComponent } from '../../../../components/dinamicos/editar-dialog/editar-dialog.component';
import { AbstractControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-aldea',
  templateUrl: './aldea.component.html',
  styleUrls: ['./aldea.component.scss']
})
export class AldeaComponent implements OnInit {
  dataSource: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  myColumns: TableColumn[] = [];
  aldeas: any[] = [];
  private executeFunction?: (data: any[]) => Promise<boolean>;

  constructor(
    private direccionService: DireccionService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadDepartamentos();
    this.myColumns = [
      { header: 'Aldea', col: 'nombre' },
      { header: 'Municipio', col: 'municipio' },
      { header: 'Departamento', col: 'departamento' },
      { header: 'Estado', col: 'estado' }
    ];
    this.loadAldeas();
  }

  async loadAldeas(): Promise<void> {
    try {
      const data = await this.direccionService.getAldeas().toPromise();
      if (!data) {
        this.aldeas = [];
        return;
      }
      
      this.aldeas = data.map((a: any) => ({
        id_aldea: a.value,
        nombre: a.label,
        municipio: a.municipio || 'Sin municipio',
        departamento: a.departamento || 'Sin departamento',
        estado: a.estado || 'ACTIVO'
      }));
  
      if (this.executeFunction) {
        this.executeFunction(this.aldeas);
      }
    } catch (error) {
      this.toastr.error('Error al cargar las aldeas', 'Error');
      console.error('Error al obtener las aldeas:', error);
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
        title: 'Aldea',
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
            label: 'Nombre de la Aldea',
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
        this.direccionService.crearAldea(result.nombre, result.municipio).subscribe(() => {
          this.loadAldeas();
          this.toastr.success('Aldea agregada correctamente', 'Éxito');
        }, error => {
          this.toastr.error('No se pudo agregar la aldea', 'Error');
        });
      }
    });
  }

  editarAldea(aldea: any) {
    this.direccionService.actualizarAldea(aldea.id_aldea, aldea.nombre).subscribe(() => {
      this.loadAldeas();
      this.toastr.success('Aldea actualizada correctamente', 'Éxito');
    }, error => {
      this.toastr.error('No se pudo actualizar la aldea', 'Error');
    });
  }

  manejarEditarAldea(aldea: any) {
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
          nombre: aldea.nombre,
          estado: aldea.estado ?? 'ACTIVO',
          observacion: aldea.observacion || ''
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
          .actualizarAldea(aldea.id_aldea, result.nombre, result.estado, result.observacion)
          .subscribe({
            next: () => {
              this.loadAldeas();
              this.toastr.success(
                `Aldea ${result.estado === 'ACTIVO' ? 'activada' : 'actualizada'} correctamente`,
                'Éxito'
              );
            },
            error: () => {
              this.toastr.error('No se pudo actualizar la aldea', 'Error');
            }
          });
      }
    });
  }
  
  getData = async (): Promise<any[]> => {
    return this.aldeas;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any[]) => Promise<boolean>) {
    this.executeFunction = funcion;
  }

  
}
