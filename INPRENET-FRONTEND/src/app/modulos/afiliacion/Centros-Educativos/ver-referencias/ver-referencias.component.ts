import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ReferenciasBancariasComercialesComponent } from '../referencias-bancarias-comerciales/referencias-bancarias-comerciales.component';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { ControlContainer } from '@angular/forms';
@Component({
  selector: 'app-ver-referencias',
  templateUrl: './ver-referencias.component.html',
  styleUrls: ['./ver-referencias.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
       useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
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

  @Input() parentForm: any = 1;

  constructor(
    private dialog: MatDialog,
    private SVCCentrosTrab: CentroTrabajoService,) {
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
      const data = await this.SVCCentrosTrab.getAllReferenciasByCentro(1).toPromise();

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

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
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
      { nombre: 'periodoInicio', tipo: 'number', requerido: true, etiqueta: 'Fecha de inicio' },
      { nombre: 'periodoFinalizacion', tipo: 'number', requerido: true, etiqueta: 'Fecha de finalización' },
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
