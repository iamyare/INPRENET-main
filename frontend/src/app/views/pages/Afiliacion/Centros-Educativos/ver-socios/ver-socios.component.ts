import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { SociedadSocioComponent } from '../sociedad-socio/sociedad-socio.component';
/* import { SociedadSocioComponent } from '../../Afiliacion/Centros-Educativos/sociedad-socio/sociedad-socio.component'; */

@Component({
  selector: 'app-ver-socios',
  templateUrl: './ver-socios.component.html',
  styleUrl: './ver-socios.component.scss'
})
export class VerSociosComponent {
  unirNombres: any = unirNombres;
  //convertirFecha: any = this.convertirFecha;

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
        header: 'Tipo De Referencia',
        col: 'tipoReferencia',
        isEditable: false
      },
      {
        header: 'Nombre De Referencia',
        col: 'nombre',
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

  editar = (row: any) => {
    const beneficioData = {
      nombre_beneficio: row.nombre_beneficio,
      descripcion_beneficio: row.descripcion_beneficio,
      numero_rentas_max: row.numero_rentas_max,
      periodicidad: row.periodicidad,
    };

    console.log(beneficioData);


    /* this.svcBeneficioServ.updateBeneficio(row.id, beneficioData).subscribe(
      response => {
        this.toastr.success('Beneficio editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar el beneficio');
      }
    ); */
  };

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'numero_rentas_max', tipo: 'number', requerido: true, etiqueta: 'Número de rentas máximas', editable: false },
      { nombre: 'periodoInicio', tipo: 'number', requerido: true, etiqueta: 'Período de inicio' },
      { nombre: 'periodoFinalizacion', tipo: 'number', requerido: true, etiqueta: 'Período de finalización' },
      { nombre: 'monto_por_periodo', tipo: 'text', requerido: true, etiqueta: 'Monto por período' },
      { nombre: 'Monto_total', tipo: 'number', requerido: true, etiqueta: 'Monto Total' },

    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Datos editados:', result);
      }
    });
  }
  manejarAccionDos(row: any) {
    const campos = [
      { nombre: 'numero_rentas_max', tipo: 'number', requerido: true, etiqueta: 'Número de rentas máximas', editable: false },
      { nombre: 'periodoInicio', tipo: 'number', requerido: true, etiqueta: 'Período de inicio' },
      { nombre: 'periodoFinalizacion', tipo: 'number', requerido: true, etiqueta: 'Período de finalización' },
      { nombre: 'monto_por_periodo', tipo: 'text', requerido: true, etiqueta: 'Monto por período' },
      { nombre: 'Monto_total', tipo: 'number', requerido: true, etiqueta: 'Monto Total' },

    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Datos editados:', result);
      }
    });
  }

  AgregarSocios() {
    const dialogRef = this.dialog.open(SociedadSocioComponent, {
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
