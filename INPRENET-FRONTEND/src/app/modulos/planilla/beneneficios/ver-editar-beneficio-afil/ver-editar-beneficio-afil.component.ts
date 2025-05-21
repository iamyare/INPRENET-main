import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { convertirFecha } from '../../../../shared/functions/formatoFecha';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { format, parseISO } from 'date-fns';
import { montoTotalValidator, noDecimalValidator } from '../nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { AuthService } from 'src/app/services/auth.service';

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
  dataActu: any;
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
  userRole: { rol: string; modulo: string }[] = []; // Ahora userRole es un array de objetos

  rolesPermitidos = ['ASIGNADOR DE BENEFICIOS', 'EDITOR DE BENEFICIOS ASIGNADOS'];
  tieneAcceso: boolean = false;
  mostrarEdi: boolean = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private http: HttpClient,
    private beneficioService: BeneficiosService,
    private afiliadoDVC: AfiliadoService,
    private datePipe: DatePipe,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRolesModulos(); // Obtener el rol del usuario autenticado

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'N Expediente',
        col: 'n_expediente',
        isEditable: true
      },
      {
        header: 'Fecha Presentación',
        col: 'fecha_presentacion',
        isEditable: false
      },
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
        header: 'Periodicidad',
        col: 'periodicidad',
        isEditable: false
      },
      {
        header: 'Fecha de efectividad',
        col: 'fecha_efectividad',
        isEditable: true
      },
      {
        header: 'Fecha de finalización',
        col: 'periodo_finalizacion',
        isEditable: true
      },
      {
        header: 'Número de rentas aprobadas',
        col: 'num_rentas_aprobadas',
        isEditable: false
      },
      {
        header: 'Monto por periodo',
        col: 'monto_por_periodo',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Número de rentas a pagar en la primera cuota',
        col: 'num_rentas_pagar_primer_pago',
        isEditable: false
      },
      {
        header: 'Monto retroactivo / Extraordinario',
        col: 'monto_retroactivo',
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
        header: 'Dias de la última renta',
        col: 'ultimo_dia_ultima_renta',
        isEditable: true
      },
      {
        header: 'Monto última renta',
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

  tieneRol(rol: string): boolean {
    return this.userRole.some(item => item.rol === rol);
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      const data = await this.beneficioService.GetAllBeneficios(this.form.value.dni).toPromise();
      const datas = await this.afiliadoDVC.findTipoPersonaByN_ident(this.form.value.dni).toPromise();

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
      } if (data.detBen.length > 0) {
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

      /* this.filasT = data.detBen.map((item: any) => {
        return {
          tipoPersona: item.persona.tipoPersona.tipo_persona,
          ID_DETALLE_PERSONA: item.ID_DETALLE_PERSONA,
          ID_PERSONA: item.ID_PERSONA,
          ID_CAUSANTE: item.ID_CAUSANTE,
          ID_BENEFICIO: item.ID_BENEFICIO,
          estado_solicitud: item.estado_solicitud,
          listo_complementaria: item.listo_complementaria,
          dni: item.persona.n_identificacion,
          dni_causante: item.persona?.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
          n_expediente: item.n_expediente,

          fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
          fecha_efectividad: item.fecha_efectividad,
          fecha_presentacion: item.fecha_presentacion,

          periodo_inicio: convertirFecha(item.periodo_inicio, false),
          periodo_finalizacion: item.beneficio.periodicidad === "V"
            ? "NO APLICA"
            : item.periodo_finalizacion,

          nombre_beneficio: item.beneficio.nombre_beneficio,
          num_rentas_aprobadas: item.num_rentas_aprobadas || "NO APLICA",
          ultimo_dia_ultima_renta: item.ultimo_dia_ultima_renta || "NO APLICA",
          periodicidad: item.beneficio.periodicidad,
          monto_por_periodo: item.monto_por_periodo || 0,
          monto_ultima_cuota: item.monto_ultima_cuota || 0,
          monto_primera_cuota: item.monto_primera_cuota || 0,
          monto_retroactivo: item.monto_retroactivo || 0,
          monto_total: item.monto_total || 0,

          recibiendo_beneficio: item.recibiendo_beneficio,
          observaciones: item.observaciones || "NO TIENE",
          voluntario: item.persona.voluntario || "NO TIENE",
          numero_rentas_max: item.beneficio.numero_rentas_max,
          num_rentas_pagar_primer_pago: item.num_rentas_pagar_primer_pago
        }
      }); */

      this.mostrarEdi = false;
      this.filasT = data.detBen
        .map((item: any) => {

          if (item.detallePagBeneficio.length > 0 && (this.tieneRol("EDITOR DE BENEFICIOS ASIGNADOS") || this.tieneRol("ASIGNADOR DE BENEFICIOS"))) {
            const existeEnPreliminar = item.detallePagBeneficio.some((b: { estado: string; }) => b.estado === 'EN PRELIMINAR');

            if (existeEnPreliminar && (this.tieneRol("EDITOR DE BENEFICIOS ASIGNADOS") || this.tieneRol("ASIGNADOR DE BENEFICIOS"))) {
              this.mostrarEdi = true;
            } else if (!existeEnPreliminar && (this.tieneRol("EDITOR DE BENEFICIOS ASIGNADOS"))) {
              this.mostrarEdi = true;
            }

          } else if (item.detallePagBeneficio.length == 0 && (this.tieneRol("EDITOR DE BENEFICIOS ASIGNADOS") || this.tieneRol("ASIGNADOR DE BENEFICIOS"))) {
            this.mostrarEdi = true;
          }

          return {
            tipoPersona: item.persona.tipoPersona.tipo_persona,
            ID_DETALLE_PERSONA: item.ID_DETALLE_PERSONA,
            ID_PERSONA: item.ID_PERSONA,
            ID_CAUSANTE: item.ID_CAUSANTE,
            ID_BENEFICIO: item.ID_BENEFICIO,
            estado_solicitud: item.estado_solicitud,
            listo_complementaria: item.listo_complementaria,
            dni: item.persona.n_identificacion,
            dni_causante: item.persona?.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
            n_expediente: item.n_expediente,

            fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
            fecha_efectividad: item.fecha_efectividad,
            fecha_presentacion: item.fecha_presentacion,

            periodo_inicio: convertirFecha(item.periodo_inicio, false),
            periodo_finalizacion: item.beneficio.periodicidad === "V"
              ? "NO APLICA"
              : item.periodo_finalizacion,

            nombre_beneficio: item.beneficio.nombre_beneficio,
            num_rentas_aprobadas: item.num_rentas_aprobadas || 0,
            ultimo_dia_ultima_renta: item.ultimo_dia_ultima_renta || 0,
            periodicidad: item.beneficio.periodicidad,
            monto_por_periodo: item.monto_por_periodo || 0,
            monto_ultima_cuota: item.monto_ultima_cuota || 0,
            monto_primera_cuota: item.monto_primera_cuota || 0,
            monto_retroactivo: item.monto_retroactivo || 0,
            monto_total: item.monto_total || 0,

            recibiendo_beneficio: item.recibiendo_beneficio,
            observaciones: item.observaciones || "NO TIENE",
            voluntario: item.persona.voluntario || "NO TIENE",
            numero_rentas_max: item.beneficio.numero_rentas_max,
            num_rentas_pagar_primer_pago: item.num_rentas_pagar_primer_pago
          };
        });


      if (datas) {
        const dataEstadosAfil = datas.map((item: any) => ({
          tipo_persona: item.tipoPersona.tipo_persona,
          estado_persona: item?.estadoAfiliacion?.nombre_estado,
          dni_causante: item.padreIdPersona?.persona?.n_identificacion || "NO APLICA",
        }));

        this.filasEst = dataEstadosAfil;

      }

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  previsualizarInfoAfil() {
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
    let campos: any = [{ nombre: 'n_expediente', tipo: 'text', etiqueta: 'N Expediente', editable: true, validadores: [Validators.required] },
    { nombre: 'fecha_presentacion', tipo: 'date', maxDate: new Date(), etiqueta: 'Fecha Presentación', editable: true, validadores: [Validators.required] }];

    if (row.periodicidad == "P") {
      if (row.numero_rentas_max == 1) {
        campos.push(
          { nombre: 'fecha_efectividad', maxDate: new Date(), tipo: 'date', requerido: false, etiqueta: 'Fecha Efectividad', editable: true, validadores: [Validators.required] },
          { nombre: 'monto_retroactivo', tipo: 'number', requerido: false, etiqueta: 'monto retroactivo', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },

          { nombre: 'monto_primera_cuota', tipo: 'number', requerido: false, etiqueta: 'Monto Primera Cuota', editable: true, validadores: [Validators.min(0), montoTotalValidator(), Validators.required] },
          /* { nombre: 'monto_ultima_cuota', tipo: 'number', requerido: false, etiqueta: 'Monto Ultima Cuota', editable: false, validadores: [Validators.min(0), montoTotalValidator()] }, */

          { nombre: 'estado_solicitud', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }, { label: "SUSPENDIDO", value: "SUSPENDIDO" }], etiqueta: 'Estado Solicitud', editable: true },

          { nombre: 'observaciones', tipo: 'text', requerido: false, etiqueta: 'Observaciones', editable: true },

          { nombre: 'listo_complementaria', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "COMPLEMENTARIA", value: "COMPLEMENTARIA" }, { label: "EXTRAORDINARIA", value: "EXTRAORDINARIA" }], etiqueta: '¿Elija el tipo de planilla COMPLEMENTARIA O EXTRAORDINARIA?', editable: true },
        )
      } else if (row.numero_rentas_max > 1 || row.numero_rentas_max == 0) {
        campos.push(
          { nombre: 'monto_por_periodo', tipo: 'number', requerido: false, etiqueta: 'Monto mensual del beneficio', editable: true, validadores: [Validators.min(0), montoTotalValidator(), Validators.required] },

          { nombre: 'num_rentas_aprobadas', tipo: 'text', requerido: false, etiqueta: 'Número de rentas aprobadas', editable: true, validadores: [Validators.min(1)] },

          {
            nombre: 'ultimo_dia_ultima_renta', tipo: 'number', requerido: false, etiqueta: 'Dias de la última renta', editable: true, validadores: [
              Validators.min(0),
              Validators.max(31),
            ]
          },

          { nombre: 'monto_ultima_cuota', tipo: 'number', requerido: false, etiqueta: 'Monto última renta', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },

          { nombre: 'fecha_efectividad', tipo: 'date', requerido: false, etiqueta: 'Fecha de Efectividad', editable: true, validadores: [Validators.required] },

          { nombre: 'periodo_finalizacion', tipo: 'date', requerido: false, etiqueta: 'Última Fecha de pago', editable: false, validadores: [] },

          { nombre: 'num_rentas_pagar_primer_pago', tipo: 'number', requerido: true, etiqueta: 'Número de rentas a pagar en la primera cuota', editable: true, validadores: [Validators.min(0), noDecimalValidator(), Validators.required] },

          { nombre: 'monto_retroactivo', tipo: 'number', requerido: false, etiqueta: 'monto retroactivo / extraordinario', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },
          { nombre: 'monto_primera_cuota', tipo: 'number', requerido: false, etiqueta: 'Monto primera cuota', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },

          { nombre: 'monto_total', tipo: 'number', requerido: false, etiqueta: 'Monto total', editable: false, validadores: [Validators.min(0), montoTotalValidator()] },

          { nombre: 'estado_solicitud', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }, { label: "SUSPENDIDO", value: "SUSPENDIDO" }], etiqueta: 'Estado Solicitud', editable: true },

          { nombre: 'observaciones', tipo: 'text', requerido: false, etiqueta: 'Observaciones', editable: true },

          { nombre: 'listo_complementaria', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "COMPLEMENTARIA", value: "COMPLEMENTARIA" }, { label: "EXTRAORDINARIA", value: "EXTRAORDINARIA" }], etiqueta: '¿Elija el tipo de planilla COMPLEMENTARIA O EXTRAORDINARIA?', editable: true },
        )
      }

    } else if (row.periodicidad == "V") {
      campos.push(
        { nombre: 'fecha_efectividad', maxDate: new Date(), tipo: 'date', requerido: false, etiqueta: 'Fecha Efectividad', editable: true, validadores: [Validators.required] },

        { nombre: 'monto_por_periodo', tipo: 'number', requerido: false, etiqueta: 'Monto por periodo', editable: true, validadores: [Validators.min(0), montoTotalValidator(), Validators.required] },

        { nombre: 'num_rentas_pagar_primer_pago', tipo: 'number', requerido: false, etiqueta: 'Número de rentas a pagar en la primera cuota', editable: true, validadores: [Validators.min(0), noDecimalValidator(), Validators.required] },

        { nombre: 'monto_retroactivo', tipo: 'number', requerido: false, etiqueta: 'monto retroactivo / extraordinario', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },
        { nombre: 'monto_primera_cuota', tipo: 'number', requerido: false, etiqueta: 'Monto primera cuota', editable: true, validadores: [Validators.min(0), montoTotalValidator()] },

        { nombre: 'estado_solicitud', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "APROBADO", value: "APROBADO" }, { label: "RECHAZADO", value: "RECHAZADO" }, { label: "SUSPENDIDO", value: "SUSPENDIDO" }], etiqueta: 'Estado Solicitud', editable: true },

        { nombre: 'observaciones', tipo: 'text', requerido: false, etiqueta: 'Observaciones', editable: true },

        { nombre: 'listo_complementaria', validadores: [Validators.required], tipo: 'list', requerido: false, opciones: [{ label: "COMPLEMENTARIA", value: "COMPLEMENTARIA" }, { label: "EXTRAORDINARIA", value: "EXTRAORDINARIA" }], etiqueta: '¿Este beneficio va en complementaria?', editable: true },
      );
    }

    if (row.tipoPersona == "BENEFICIARIO" || row.tipoPersona == "DESIGNADO") {
      //campos.pop()
    }

    row.monto_por_periodo = parseFloat(row.monto_por_periodo?.toFixed(2));
    row.monto_primera_cuota = parseFloat(row.monto_primera_cuota?.toFixed(2));
    row.monto_ultima_cuota = parseFloat(row.monto_ultima_cuota?.toFixed(2));

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    //

    dialogRef.componentInstance.formUpdated.subscribe((formValues: any) => {

      const campoActualizar = campos;

      this.dataActu = formValues;

      if (this.dataActu.periodo_finalizacion) {
        this.dataActu.periodo_finalizacion = new Date(this.dataActu.periodo_finalizacion.getTime());
      }


      if (campoActualizar) {
        this.cdr.detectChanges();
      }

    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dataActu["ID_DETALLE_PERSONA"] = row.ID_DETALLE_PERSONA;
        this.dataActu["ID_PERSONA"] = row.ID_PERSONA;
        this.dataActu["ID_CAUSANTE"] = row.ID_CAUSANTE;
        this.dataActu["ID_BENEFICIO"] = row.ID_BENEFICIO;

        this.beneficioService.updateBeneficioPersona(this.dataActu).subscribe(
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
