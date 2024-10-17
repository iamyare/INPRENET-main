import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { convertirFecha } from '../../../../shared/functions/formatoFecha';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-ver-editar-beneficio-afil',
  templateUrl: './ver-editar-beneficio-afil.component.html',
  styleUrl: './ver-editar-beneficio-afil.component.scss'
})
export class VerEditarBeneficioAfilComponent {
  unirNombres: any = unirNombres;
  convertirFecha: any = convertirFecha;

  Afiliado: any;
  form: any
  public myFormFields: FieldConfig[] = []
  public monstrarBeneficios: boolean = false;

  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] = [];
  ejecF: any;

  myColumns1: TableColumn[] = [];
  filasEst: any[] = [];
  ejecF2: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private http: HttpClient,
    private beneficioService: BeneficiosService,
    private afiliadoDVC: AfiliadoService,
    private datePipe: DatePipe,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'Nombre del beneficio',
        col: 'nombre_beneficio',
        isEditable: false
      },
      {
        header: 'DNI CAUSANTE',
        col: 'dni_causante',
        isEditable: false
      },
      {
        header: 'Recibiendo beneficio',
        col: 'recibiendo_beneficio',
        isEditable: false
      },
      {
        header: 'Periodicidad',
        col: 'periodicidad',
        isEditable: false
      },
      {
        header: 'Número de rentas máximas',
        col: 'numero_rentas_max',
        isEditable: false
      },
      {
        header: 'Periodo de inicio',
        col: 'periodoInicio',
        isEditable: true
      },
      {
        header: 'Periodo de finalización',
        col: 'periodoFinalizacion',
        isEditable: true
      },
      {
        header: 'Monto por periodo',
        col: 'monto_por_periodo',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Monto total',
        col: 'monto_total',
        moneda: true,
        isEditable: true
      },
    ];

    this.myColumns1 = [
      {
        header: 'Tipo Persona',
        col: 'tipo_persona',
        isEditable: false
      },
      /* {
        header: 'Estado',
        col: 'estado_persona',
        isEditable: false
      }, */
      {
        header: 'DNI CAUSANTE',
        col: 'dni_causante',
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
      const data = await this.beneficioService.GetAllBeneficios(this.form.value.dni).toPromise();

      const dataAfil = data.persona.map((item: any) => ({
        dni: item.N_IDENTIFICACION,
        fallecido: item.FALLECIDO,
        estado_civil: item.ESTADO_CIVIL,
        nombreCompleto: unirNombres(item.PRIMER_NOMBRE, item.SEGUNDO_NOMBRE, item.PRIMER_APELLIDO, item.SEGUNDO_APELLIDO),
        genero: item.GENERO,
        profesion: item.PROFESION,
        telefono_1: item.TELEFONO_1,
        colegio_magisterial: item.COLEGIO_MAGISTERIAL,
        direccion_residencia: item.DIRECCION_RESIDENCIA,
        fecha_nacimiento: convertirFecha(item.FECHA_NACIMIENTO, false)
      }));

      this.Afiliado = dataAfil[0]

      this.filasT = data.detBen.map((item: any) => {
        return {
          prestamo: item.prestamo,
          ID_DETALLE_PERSONA: item.ID_DETALLE_PERSONA,
          ID_PERSONA: item.ID_PERSONA,
          ID_CAUSANTE: item.ID_CAUSANTE,
          ID_BENEFICIO: item.ID_BENEFICIO,
          estado_solicitud: item.estado_solicitud,
          dni: item.persona.n_identificacion,
          dni_causante: item.persona?.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
          fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
          nombre_beneficio: item.beneficio.nombre_beneficio,
          recibiendo_beneficio: item.recibiendo_beneficio,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          periodicidad: item.beneficio.periodicidad,
          monto_por_periodo: item.monto_por_periodo,
          monto_total: item.monto_total,
          periodoInicio: convertirFecha(item.periodo_inicio, false),
          periodoFinalizacion: convertirFecha(item.periodo_finalizacion, false),
          monto_primera_cuota: item.monto_primera_cuota,
          monto_ultima_cuota: item.monto_ultima_cuota,
          observaciones: item.observaciones
        }
      });
      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };
  getFilas2 = async () => {
    try {

      const datas = await this.afiliadoDVC.findTipoPersonaByN_ident(this.form.value.dni).toPromise();

      const dataEstadosAfil = datas.map((item: any) => ({
        tipo_persona: item.tipoPersona.tipo_persona,
        estado_persona: item.estadoAfiliacion.nombre_estado,
        dni_causante: item.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
      }));

      this.filasEst = dataEstadosAfil;

      return this.filasEst;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };


  previsualizarInfoAfil() {
    this.monstrarBeneficios = true;
    this.getFilas().then(() => this.cargar("ingresos"));
    this.getFilas2().then(() => this.cargar("tipo"));
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }
  ejecutarFuncionAsincronaDesdeOtroComponente2(funcion: (data: any) => Promise<void>) {
    this.ejecF2 = funcion;
  }

  cargar(val: string) {
    if (this.ejecF && val == "ingresos") {
      this.ejecF(this.filasT).then(() => {
      });
    } else if (this.ejecF2 && val == "tipo") {
      this.ejecF2(this.filasEst).then(() => {
      });
    }
  }

  editar = (row: any) => {
    const beneficioData = {
      nombre_beneficio: row.nombre_beneficio,
      recibiendo_beneficio: row.recibiendo_beneficio,
      descripcion_beneficio: row.descripcion_beneficio,
      numero_rentas_max: row.numero_rentas_max,
      periodicidad: row.periodicidad,
    };

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
      { nombre: 'numero_rentas_max', tipo: 'number', requerido: true, etiqueta: 'Número de rentas aprobadas' },
      { nombre: 'periodoInicio', tipo: 'date', requerido: true, etiqueta: 'Periodo de inicio' },
      { nombre: 'periodoFinalizacion', tipo: 'date', requerido: true, etiqueta: 'Periodo de finalización', editable: true },
      { nombre: 'Monto_total', tipo: 'number', requerido: true, etiqueta: 'Monto Total', editable: true },
      { nombre: 'monto_por_periodo', tipo: 'text', requerido: true, etiqueta: 'Monto por periodo', editable: true },
      { nombre: 'monto_ultima_cuota', tipo: 'number', requerido: true, etiqueta: 'monto_ultima_cuota', editable: true },
      { nombre: 'monto_primera_cuota', tipo: 'number', requerido: true, etiqueta: 'monto_primera_cuota', editable: true },
      { nombre: 'estado_solicitud', tipo: 'list', requerido: true, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }], etiqueta: 'Estado Solicitud', editable: true },
      { nombre: 'observaciones', tipo: 'text', requerido: true, etiqueta: 'observaciones', editable: true },
      { nombre: 'prestamo', tipo: 'list', requerido: true, opciones: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }], etiqueta: '¿Tiene algún prestamo?', editable: true },
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        result["ID_DETALLE_PERSONA"] = row.ID_DETALLE_PERSONA;
        result["ID_PERSONA"] = row.ID_PERSONA;
        result["ID_CAUSANTE"] = row.ID_CAUSANTE;
        result["ID_BENEFICIO"] = row.ID_BENEFICIO;

        this.beneficioService.updateBeneficioPersona(result).subscribe(
          () => {
            // Después de actualizar el beneficio, recargar los datos
            this.toastr.success("Registro actualizado con éxito");
            this.cargarDatosActualizados();
            // Forzar la detección de cambios
            this.cdr.detectChanges();
          },
          error => {
            this.toastr.error("Error al actualizar el beneficio");
            console.error('Error al actualizar el beneficio', error);
          }
        );
      }
    });
  }

  cargarDatosActualizados() {
    this.beneficioService.GetAllBeneficios(this.form.value.dni).subscribe(
      (data: any) => {
        this.filasT = data;  // Actualiza los datos de la tabla
        // Forzar la detección de cambios
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error al cargar los beneficios actualizados', error);
      }
    );
  }


}
