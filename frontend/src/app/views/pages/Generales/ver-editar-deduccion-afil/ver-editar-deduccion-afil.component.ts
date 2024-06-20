import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from '../../../../../components/editar-dialog/editar-dialog.component';

@Component({
  selector: 'app-ver-editar-deduccion-afil',
  templateUrl: './ver-editar-deduccion-afil.component.html',
  styleUrl: './ver-editar-deduccion-afil.component.scss'
})
export class VerEditarDeduccionAfilComponent implements OnInit {
  unirNombres: any = unirNombres;
  //Para generar tabla
  columns: TableColumn[] = [];
  deducciones: any[] = [];
  filasT: any[] = [];
  ejecF: any;

  Afiliado: any = {}
  form: any;
  public myFormFields: FieldConfig[] = [];
  public monstrarDeducciones: boolean = false;

  constructor(private deduccionesService: DeduccionesService,
    private toastr: ToastrService,
    private svcAfilServ: AfiliadoService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.columns = [
      {
        header: 'Nombre Deduccion',
        col: 'nombre_deduccion',
        isEditable: true
      },
      {
        header: 'Fecha aplicado',
        col: 'fecha_aplicado',
        isEditable: false
      },
      {
        header: 'Institucion',
        col: 'nombre_institucion',
        isEditable: true
      },
      {
        header: 'Año',
        col: 'anio',
        isEditable: false
      },
      {
        header: 'Mes',
        col: 'mes',
        isEditable: false
      },
      {
        header: 'Código de planilla',
        col: 'codigo_planilla',
        isEditable: false
      },
      {
        header: 'Estado de aplicacion',
        col: 'estado_aplicacion',
        isEditable: false
      },
      {
        header: 'Monto total',
        col: 'monto_total',
        isEditable: true
      }
    ]
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  getFilas = async () => {
    try {
      const data = await this.deduccionesService.buscarDeduccionesPorDni(this.form.value.dni).toPromise();

      this.filasT = data.map((item: any) => ({
        anio: item.anio,
        estado_aplicacion: item.estado_aplicacion,
        fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
        mes: item.mes,
        monto_total: item.monto_total,
        id_ded_deduccion: item.id_ded_deduccion,
        nombre_deduccion: item.deduccion.nombre_deduccion,
        nombre_institucion: item.deduccion.institucion.nombre_institucion,
        codigo_planilla: item.planilla?.codigo_planilla ?? 'No ha sido asignado'
      }))

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  previsualizarInfoAfil() {
    this.monstrarDeducciones = true;
    this.getFilas().then(() => this.cargar());
    this.Afiliado.nameAfil = "";
    if (this.form.value.dni) {
      this.svcAfilServ.getAfiliadoDNI(this.form.value.dni).subscribe(async (result) => {
        this.Afiliado = result;
        this.Afiliado.nameAfil = this.unirNombres(result.primer_nombre, result.segundo_nombre, result.tercer_nombre, result.primer_apellido, result.segundo_apellido);


        this.deduccionesService.buscarDeduccionesPorDni(this.form.value.dni).subscribe(deducciones => {
          this.deducciones = deducciones.map((deduccion: any) => ({
            ...deduccion,
            nombre_completo: this.Afiliado.nameAfil,
          }));
        }, error => {
          this.toastr.error(`Error al cargar deducciones: ${error.message}`);
        });
      }, error => {
        this.toastr.error(`Error al cargar información del afiliado: ${error.message}`);
      });
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filasT).then(() => {
      });
    }
  }

  async cargarOpcionesDeducciones(nombreInstitucion: string): Promise<any[]> {
    try {
      const deducciones = await this.deduccionesService.getDeduccionesByEmpresa(nombreInstitucion).toPromise();
      return deducciones.map((deduccion: any) => ({
        valor: deduccion.id_deduccion,
        etiqueta: deduccion.nombre_deduccion
      }));
    } catch (error) {
      this.toastr.error(`Error al cargar deducciones: ${error}`);
      return [];
    }
  }

  manejarAccionUno(row: any) {
    const campos = [
      {
        nombre: 'nombre_institucion',
        tipo: 'list',
        requerido: false,
        etiqueta: 'Nombre de Institución',
        editable: false,
        opciones: [
          { valor: 'INJUPEM', etiqueta: 'INJUPEM' },
          { valor: 'INPREMA', etiqueta: 'INPREMA' },
        ]
      },
      {
        nombre: 'Tipo de deduccion',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Tipo de deduccion',
        dependeDe: 'nombre_institucion',
        valorDependiente: 'INJUPEM',
      },
      {
        nombre: 'Tipo de deduccion',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Tipo de deduccion',
        dependeDe: 'nombre_institucion',
        valorDependiente: 'INPREMA',
        opciones: [
          { valor: 'INTERESES', etiqueta: 'INTERESES' },
          { valor: 'PRESTAMOS', etiqueta: 'PRESTAMOS' },
        ]
      },
      { nombre: 'monto_total', tipo: 'number', requerido: true, etiqueta: 'Monto Total' },

      {
        nombre: 'estado_aplicacion', tipo: 'list', requerido: false, etiqueta: 'Estado de Aplicación',
        opciones: [
          { valor: 'NO COBRADA', etiqueta: 'No Cobrada' },
          { valor: 'INCONSISTENCIA', etiqueta: 'Inconsistencia' }
        ]
      },
      { nombre: 'anio', tipo: 'text', requerido: true, etiqueta: 'Año', editable: false },
      { nombre: 'mes', tipo: 'text', requerido: false, etiqueta: 'Mes', editable: false },
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos editados:', result);
      }
    });
  }
}
