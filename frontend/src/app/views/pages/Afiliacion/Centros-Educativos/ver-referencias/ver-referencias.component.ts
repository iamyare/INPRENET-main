import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { ReferenciasBancariasComercialesComponent } from '../referencias-bancarias-comerciales/referencias-bancarias-comerciales.component';
/* import { ReferenciasBancariasComercialesComponent } from '../../Afiliacion/Centros-Educativos/referencias-bancarias-comerciales/referencias-bancarias-comerciales.component'; */

@Component({
  selector: 'app-ver-referencias',
  templateUrl: './ver-referencias.component.html',
  styleUrl: './ver-referencias.component.scss'
})
export class VerReferenciasComponent {

  Afiliado: any;
  form: any
  public myFormFields: FieldConfig[] = []
  public monstrarBeneficios: boolean = false;

  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] = [];
  ejecF: any;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private beneficioService: BeneficiosService,
    private datePipe: DatePipe,
    private SVCCentrosTrab: CentroTrabajoService,
    private toastr: ToastrService) {
    this.getFilas().then(() => this.cargar());
  }

  ngOnInit(): void {
    this.myColumns = [
      {
        header: 'Id Referencia',
        col: 'id_referencia',
        isEditable: false
      },
      {
        header: 'Nombre De Referencia',
        col: 'nombre',
        isEditable: false
      },
      {
        header: 'Tipo De Referencia',
        col: 'tipoReferencia',
        isEditable: false
      },
    ];
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      /* Falta traer datos de la planilla */
      const data = await this.SVCCentrosTrab.getAllReferenciasByCentro(10).toPromise();
      console.log(data);

      this.filasT = data.map((item: any) => ({
        id_referencia: item.id_referencia,
        tipoReferencia: item.tipoReferencia,
        nombre: item.nombre
      }));

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  previsualizarInfoAfil() {
    this.monstrarBeneficios = true;
    this.getFilas().then(() => this.cargar());
    if (this.form.value.dni) {

      /* this.svcAfilServ.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.primer_nombre,result.segundo_nombre, result.tercer_nombre, result.primer_apellido,result.segundo_apellido);
          //this.getBeneficios().then(() => this.cargar());
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.Afiliado.estado = ""
          this.toastr.error(`Error: ${error.error.message}`);
      }) */

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

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'numero_rentas_max', tipo: 'number', requerido: true, etiqueta: 'Número de rentas máximas', editable: false },
      { nombre: 'periodoInicio', tipo: 'number', requerido: true, etiqueta: 'Período de inicio' },
      { nombre: 'periodoFinalizacion', tipo: 'number', requerido: true, etiqueta: 'Período de finalización' },
      { nombre: 'monto_por_periodo', tipo: 'text', requerido: true, etiqueta: 'Monto por período' },
      { nombre: 'Monto_total', tipo: 'number', requerido: true, etiqueta: 'Monto Total' },

    ];

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación De Eliminación',
        message: '¿Estás seguro de querer activar este elemento?',
        /* idPersona: this.Afiliado.ID_PERSONA */
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Datos editados:', result);
      }
    });
  }

  AgregarReferencia() {
    const dialogRef = this.dialog.open(ReferenciasBancariasComercialesComponent, {
      width: '55%',
      height: '75%',
      /* data: {
        idPersona: this.Afiliado.ID_PERSONA
      } */
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });

  }
}
