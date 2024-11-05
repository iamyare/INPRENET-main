import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { convertirFecha } from '../../../../shared/functions/formatoFecha';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
interface Campo {
  nombre: string;
  tipo: string;
  etiqueta?: string;
  editable?: boolean;
  opciones?: { value: any, label: string }[];
  dependeDe?: string;
  valorDependiente?: any;
  validadores?: ValidatorFn[];
  icono?: string;
}
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
  filasT?: any[];
  ejecF?: Function;

  myColumns1: TableColumn[] = [];
  filasEst?: any[];
  ejecF2: any;
  monstrarBeneficiarios: boolean = false;

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
        header: 'DNI Causante',
        col: 'dni_causante',
        isEditable: false
      },
      {
        header: 'Estado Solicitud',
        col: 'estado_solicitud',
        isEditable: false
      },
      {
        header: 'Observaciones',
        col: 'observaciones',
        moneda: false,
        isEditable: true
      },
      {
        header: 'Préstamo',
        col: 'prestamo',
        isEditable: false
      },
      {
        header: 'Periodicidad',
        col: 'periodicidad',
        isEditable: false
      },
      {
        header: 'Número de rentas aprobadas',
        col: 'num_rentas_aplicadas',
        isEditable: false
      },
      {
        header: 'Fecha de inicio',
        col: 'periodoInicio',
        isEditable: true
      },
      {
        header: 'Fecha de finalización',
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
        header: 'Monto primera cuota',
        col: 'monto_primera_cuota',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Monto última cuota',
        col: 'monto_ultima_cuota',
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
        header: 'DNI Causante',
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

      if (data.persona.length > 0) {
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
          fecha_nacimiento: convertirFecha(item.FECHA_NACIMIENTO, false),
          voluntario: item.VOLUNTARIO || "NO APLICA"
        }));
        this.Afiliado = dataAfil[0]
      } else if (data.detBen.length > 0) {
        const temp = data.detBen[0].persona.persona

        this.Afiliado = {
          dni: temp.n_identificacion,
          fallecido: temp.fallecido,
          estado_civil: temp.estado_civil,
          nombreCompleto: unirNombres(temp.primer_nombre, temp.segundo_nombre, temp.primer_apellido, temp.segundo_apellido),
          genero: temp.genero,
          profesion: temp.profesion,
          telefono_1: temp.telefono_1,
          colegio_magisterial: temp.colegio_magisterial,
          direccion_residencia: temp.direccion_residencia,
          fecha_nacimiento: convertirFecha(temp.fecha_nacimiento, false),
          voluntario: data.detBen[0].persona.voluntario || "NO APLICA"
        }
      } else {
        this.monstrarBeneficiarios = false;
        this.monstrarBeneficios = false;
        this.toastr.warning("No existe el registro")
      }


      this.filasT = data.detBen.map((item: any) => {
        return {
          prestamo: item.prestamo || "NO",
          tipoPersona: item.persona.tipoPersona.tipo_persona,
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
          num_rentas_aplicadas: item.num_rentas_aplicadas || "NO APLICA",
          ultimo_dia_ultima_renta: item.ultimo_dia_ultima_renta,
          periodicidad: item.beneficio.periodicidad,
          monto_por_periodo: item.monto_por_periodo,
          monto_total: item.monto_total,
          periodoInicio: convertirFecha(item.periodo_inicio, false),
          periodoFinalizacion: item.beneficio.periodicidad === "V"
            ? "NO APLICA"
            : convertirFecha(item.periodo_finalizacion, false),
          monto_primera_cuota: item.monto_primera_cuota,
          monto_ultima_cuota: item.monto_ultima_cuota,
          observaciones: item.observaciones || "NO TIENE",
          voluntario: item.persona.voluntario || "NO TIENE"
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

      if (datas) {
        const dataEstadosAfil = datas.map((item: any) => ({
          tipo_persona: item.tipoPersona.tipo_persona,
          estado_persona: item?.estadoAfiliacion?.nombre_estado,
          dni_causante: item.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
        }));

        this.filasEst = dataEstadosAfil;

        return this.filasEst;
      } else {
        return []
      }

    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  previsualizarInfoAfil() {
    this.getFilas2().then(() => this.cargar2());
    this.getFilas().then(() => this.cargar2());
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente2(funcion: (data: any) => Promise<boolean>) {
    this.ejecF2 = funcion;
  }

  cargar2() {
    this.cdr.detectChanges();
    this.monstrarBeneficiarios = false;
    this.monstrarBeneficios = false;

    if (this.ejecF2 && this.ejecF) {
      this.ejecF2(this.filasEst).then((val: boolean) => {
        if (val) {
          this.monstrarBeneficiarios = true;
        } else {
          this.monstrarBeneficiarios = false;
        }
        this.cdr.detectChanges();
      });
      this.ejecF(this.filasT).then((val: boolean) => {
        if (val) {
          this.monstrarBeneficios = true;
        } else {
          this.monstrarBeneficios = false;
        }
        this.cdr.detectChanges();
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
    let campos: any = [];

    if (row.periodicidad == "P") {
      campos = [
        /* { nombre: 'periodoInicio', tipo: 'date', requerido: true, etiqueta: 'Periodo de inicio' },
        { nombre: 'periodoFinalizacion', tipo: 'date', requerido: true, etiqueta: 'Periodo de finalización', editable: false }, */
        { nombre: 'num_rentas_aplicadas', tipo: 'number', requerido: false, etiqueta: 'Número de rentas aprobadas', editable: true, validadores: [Validators.min(0)] },
        {
          nombre: 'ultimo_dia_ultima_renta', tipo: 'number', requerido: false, etiqueta: 'ultimo dia ultima renta', editable: true, validadores: [Validators.min(0), Validators.min(1),
          Validators.max(31),]
        },
        { nombre: 'monto_total', tipo: 'number', requerido: false, etiqueta: 'Monto Total', editable: true, validadores: [Validators.min(0)] },
        { nombre: 'monto_por_periodo', tipo: 'text', requerido: false, etiqueta: 'Monto por periodo', editable: true, validadores: [Validators.min(0)] },
        { nombre: 'monto_ultima_cuota', tipo: 'number', requerido: false, etiqueta: 'monto_ultima_cuota', editable: true, validadores: [Validators.min(0)] },
        { nombre: 'monto_primera_cuota', tipo: 'number', requerido: false, etiqueta: 'monto_primera_cuota', editable: true, validadores: [Validators.min(0)] },
        { nombre: 'estado_solicitud', tipo: 'list', requerido: false, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }], etiqueta: 'Estado Solicitud', editable: true },
        { nombre: 'observaciones', tipo: 'text', requerido: false, etiqueta: 'observaciones', editable: true },
        { nombre: 'prestamo', tipo: 'list', requerido: false, opciones: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }], etiqueta: '¿Tiene algún préstamo pendiente con INPREMA?', editable: true },
      ];
    } else {
      campos = [
        /* { nombre: 'periodoInicio', tipo: 'date', requerido: false, etiqueta: 'Periodo de inicio' },
        { nombre: 'periodoFinalizacion', tipo: 'date', requerido: false, etiqueta: 'Periodo de finalización', editable: false },
        { nombre: 'num_rentas_aplicadas', tipo: 'number', requerido: false, etiqueta: 'Número de rentas aprobadas', editable: true },*/
        { nombre: 'monto_total', tipo: 'number', requerido: false, etiqueta: 'Monto Total', editable: true, },
        { nombre: 'monto_por_periodo', tipo: 'text', requerido: false, etiqueta: 'Monto por periodo', editable: true },
        { nombre: 'monto_ultima_cuota', tipo: 'number', requerido: false, etiqueta: 'monto_ultima_cuota', editable: true },
        { nombre: 'monto_primera_cuota', tipo: 'number', requerido: false, etiqueta: 'monto_primera_cuota', editable: true },
        { nombre: 'estado_solicitud', tipo: 'list', requerido: false, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }], etiqueta: 'Estado Solicitud', editable: true },
        { nombre: 'observaciones', tipo: 'text', requerido: false, etiqueta: 'observaciones', editable: true },
        { nombre: 'prestamo', tipo: 'list', requerido: false, opciones: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }], etiqueta: '¿Tiene algún préstamo pendiente con INPREMA?', editable: true },
      ];

    }

    if (row.tipoPersona == "BENEFICIARIO" || row.tipoPersona == "DESIGNADO") {
      campos.pop()
    }

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
            this.previsualizarInfoAfil();
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
