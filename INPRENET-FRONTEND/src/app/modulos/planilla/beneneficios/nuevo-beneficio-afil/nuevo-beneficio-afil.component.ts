import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { addDays, addMonths, endOfMonth, format, parseISO } from 'date-fns';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { BehaviorSubject } from 'rxjs';

// Función de validación personalizada que retorna un mensaje de error
export function montoTotalValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Si el valor no está definido o está vacío, no hacemos nada (esto se maneja con Validators.required)
    if (!value) return null;

    // Expresión regular para validar el formato: hasta 7 dígitos antes del decimal, 2 dígitos después
    const regex = /^\d{1,7}(\.\d{1,2})?$/;

    // Si no coincide con el patrón, retorna un objeto con el mensaje de error
    if (!regex.test(value)) {
      return { montoTotalInvalid: 'El monto debe tener hasta 7 dígitos antes del punto decimal y 2 decimales.' };
    }

    // Si todo está correcto, retorna null (sin errores)
    return null;
  };
}
export function noDecimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && /\.\d+$/.test(value)) {
      return { noDecimal: true };
    }
    return null;
  };
}


function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  const selectedDate = new Date(control.value);
  const currentDate = new Date();

  // Si la fecha es válida y no se pasa de la fecha actual
  return selectedDate <= currentDate ? null : { noFutureDate: true };
}

@Component({
  selector: 'app-nuevo-beneficio-afil',
  templateUrl: './nuevo-beneficio-afil.component.html',
  styleUrl: './nuevo-beneficio-afil.component.scss'
})
export class NuevoBeneficioAfilComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form!: FormGroup;
  form1!: FormGroup;
  FormBen: any

  datosFormateados: any = {};
  unirNombres: any = unirNombres;
  tiposBeneficios: any = [];
  tiposBeneficiosLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  mostrarDB = false

  public myFormFields: FieldConfig[] = []
  public myFormFields1: FieldConfig[] = []
  public myFormFields2: FieldConfig[] = []

  Afiliado?: any

  myColumns: any = [
    { header: 'N_Identificacion', col: 'dni', },
    {
      header: 'Nombre Completo',
      col: 'nombre_completo',

    },
    { header: 'Género', col: 'genero', },
    {
      header: 'Tipo Afiliado',
      col: 'tipo_afiliado',

    },
    { header: 'Porcentaje', col: 'porcentaje', },
  ];

  datosTabl: any[] = [];
  filas: any[] = []; // Initialize as an empty array
  ejecF: any;
  desOBenSeleccionado: any
  mostrarB: any;
  hasBeneficios: any = [];

  tiposPersona: any[] = [
    { label: "AFILIADO", value: 'AFILIADO' },
    { label: "JUBILADO", value: 'JUBILADO' },
    { label: "PENSIONADO", value: 'PENSIONADO' }
  ];

  tipoPersonaSelected: any = null;
  tipoBenefSelected: any = null;
  beneficios: any;
  tipoPersona: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService, private fb: FormBuilder,
    private toastr: ToastrService, private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'N° de identificación del afiliado', name: 'dni', validations: [Validators.required], display: true },
    ];
  }

  previsualizarInfoAfil() {
    this.FormBen?.reset()
    this.form1?.reset()
    this.mostrarB = false;

    this.Afiliado = { nameAfil: "" }

    if (this.form.value.dni) {
      this.svcAfilServ.getAfilByDni(this.form.value.dni).subscribe(
        async (res) => {
          this.hasBeneficios = res?.BENEFICIOS;
          //console.log(res);

          if (res) {
            const item = {
              id_persona: res.ID_PERSONA,
              dni: res.N_IDENTIFICACION,
              fallecido: res.FALLECIDO,
              estado_persona: res?.ESTADO_PERSONA,
              id_tipo_persona: res.ID_TIPO_PERSONA,
              tipo_persona: res.TIPO_PERSONA,
              estado_civil: res.ESTADO_CIVIL,
              nombreCompleto: unirNombres(res.PRIMER_NOMBRE, res.SEGUNDO_NOMBRE, res.PRIMER_APELLIDO, res.SEGUNDO_APELLIDO),
              genero: res.GENERO,
              sexo: res.SEXO,
              profesion: res.PROFESION,
              telefono_1: res.TELEFONO_1,
              colegio_magisterial: res.COLEGIO_MAGISTERIAL,
              numero_carnet: res.NUMERO_CARNET,
              direccion_residencia: res.DIRECCION_RESIDENCIA,
              estado: res.ESTADO,
              salario_base: res.SALARIO_BASE,
              fecha_nacimiento: convertirFecha(res.FECHA_NACIMIENTO, false),
              beneficios: res.BENEFICIOS,
              voluntario: res.VOLUNTARIO || "NO APLICA",
              observacion: res.OBSERVACION || "NO APLICA"
            };
            //const tipoPersona = item.fallecido === "SI" ? "BENEFICIARIO" : item.tipo_persona;

            this.Afiliado = {
              ...item,
              nameAfil: unirNombres(res.PRIMER_NOMBRE, res.SEGUNDO_NOMBRE, res.TERCER_NOMBRE, res.PRIMER_APELLIDO, res.SEGUNDO_APELLIDO)
            };

            if (item.fallecido === "NO") {
              if (item.tipo_persona == 'AFILIADO' && (item.estado_persona == 'ACTIVO' || item.estado_persona == 'SUSPENSO AUTOMATICO' || item.estado_persona == 'SUSPENSO POR OFICIO')) {
                this.getTipoBen();
              } if (item.tipo_persona == 'AFILIADO' && (item.estado_persona == 'INACTIVO')) {
                this.toastr.warning(`La persona se encuentra ${item.estado_persona}. No se puede asignar beneficios a los Afiliados ${item.estado_persona}`, "Advertencia");
              } if (item.tipo_persona == 'JUBILADO' || item.tipo_persona == 'PENSIONADO') {
                this.getTipoBen();
                //this.toastr.warning(`La persona se encuentra: ${item.tipo_persona}. No se puede asignar beneficios a la persona porque se encuentra: ${item.tipo_persona}`, "Advertencia");
              } if (item.tipo_persona == 'VOLUNTARIO') {
                this.toastr.warning(`La persona se encuentra: ${item.tipo_persona}. No se puede asignar beneficios a la persona porque se encuentra: ${item.tipo_persona}`, "Advertencia");
              } if (item.estado_persona == 'ERROR') {
                this.toastr.warning(`La persona tiene un error: ${item.observacion}`, "Advertencia");
              }
            }

            this.getFilas().then(() => this.cargar());
          } else {
            this.toastr.error(`Asegúrese que el docente a buscar sea Afiliado Activo, Jubilado o Pensionado`, "Error: Registro no encontrado");
            this.limpiarFormulario();
          }
        },
        (error) => {
          this.Afiliado.estado = ""
          this.toastr.error(`Error: ${error.error.message}`);
        })
    }
  }

  async obtenerTipoBeneficioByTipoPersona(tipoPersonaSelected: any): Promise<any> {
    return await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(tipoPersonaSelected).toPromise();
  }

  getTipoBen = async () => {

    try {
      let beneficios = []
      let options: any = {}


      if (this.Afiliado.tipo_persona == "JUBILADO" || this.Afiliado.tipo_persona == "PENSIONADO") {
        beneficios = await this.obtenerTipoBeneficioByTipoPersona(this.Afiliado.tipo_persona);

        /* options.options = [{ label: this.Afiliado.tipo_persona, value: this.Afiliado.tipo_persona }];
        options.display = true; */

        let temp = beneficios
          .map((item: any) => {
            //if (item.beneficio.nombre_beneficio != "COSTO DE VIDA") {
            return {
              label: item.beneficio.nombre_beneficio,
              value: item.beneficio.nombre_beneficio,
              periodicidad: item.beneficio.periodicidad,
              numero_rentas_max: item.beneficio.numero_rentas_max,
              regimen: item.beneficio?.regimen?.ley
            };
            //}
            //return null; // Devuelve null explícitamente para cumplir con la expectativa de retorno.
          })
          .filter((item: any) => item !== null); // Elimina valores nulos del resultado.
        options.beneficios = temp

        this.myFormFields1 = [
          {
            type: 'date',
            label: 'Fecha de presentacion',
            name: 'fecha_presentacion',
            max: new Date().toISOString().split('T')[0],
            validations: [Validators.required, noFutureDateValidator],
            display: true,
            col: 6
          },
          {
            type: 'text', label: 'Número de expediente', name: 'n_expediente',
            readOnly: false,
            value: "",
            validations: [Validators.required,], display: true,
            col: 6
          },
          {
            type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
            options: options.beneficios,
            validations: [Validators.required], display: true,
            col: 6
          },
          {
            type: 'text', label: 'Periodicidad del beneficio', name: 'periodicidad_beneficio',
            validations: [], display: true,
            col: 6
          },
          {
            type: 'text', label: 'regimen', name: 'regimen',
            readOnly: true,
            value: "",
            validations: [], display: true,
          },
          {
            type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
            options: [{ label: 'APROBADO', value: 'APROBADO' }, { label: 'RECHAZADO', value: 'RECHAZADO' }],
            validations: [Validators.required], display: true,
            col: 12
          },
          {
            type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aprobadas', validations: [Validators.min(1)], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Dias de la última renta', name: 'ultimo_dia_ultima_renta', validations: [
              Validators.min(0),
              Validators.max(31),
            ], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Monto correspondiente a los dias restantes', name: 'monto_ultima_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Número de rentas a pagar en el primer pago', name: 'num_rentas_pagar_primer_pago', validations: [Validators.min(1)], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Monto mensual', name: 'monto_por_periodo', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 12
          },
          {
            type: 'number', label: 'monto retroactivo', name: 'monto_retroactivo', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 12
          },
          {
            type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 12
          },
          {
            type: 'date',
            label: 'Fecha de efectividad',
            name: 'fecha_efectividad',
            max: new Date().toISOString().split('T')[0],
            validations: [Validators.required, noFutureDateValidator],
            display: true,
            col: 4
          },
          {
            type: 'text',
            label: 'Última Fecha de pago',
            name: 'periodo_finalizacion',
            validations: [],
            display: false,
            col: 4
          },
          {
            type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true,
            col: 4
          },

        ];


      } else if (this.Afiliado.tipo_persona == "AFILIADO") {

        beneficios = await this.obtenerTipoBeneficioByTipoPersona(this.Afiliado.tipo_persona)

        options.options = this.tiposPersona;
        options.display = true;

        // Mapea los beneficios para generar una lista
        let temp = beneficios.map((item: any) => {
          return {
            label: item.beneficio.nombre_beneficio,
            value: item.beneficio.nombre_beneficio,
            periodicidad: item.beneficio.periodicidad,
            numero_rentas_max: item.beneficio.numero_rentas_max,
            regimen: item.beneficio?.regimen?.ley
          };
        });

        this.mostrarDB = true;
        this.myFormFields1 = [
          {
            type: 'dropdown', label: 'Tipo persona', name: 'tipo_persona',
            options: options.options,
            validations: [], display: options.display,
            col: 6
          },
          {
            type: 'date',
            label: 'Fecha de presentacion',
            name: 'fecha_presentacion',
            max: new Date().toISOString().split('T')[0],
            validations: [Validators.required, noFutureDateValidator],
            display: true,
            col: 6
          },
          {
            type: 'text', label: 'Número de expediente', name: 'n_expediente',
            readOnly: false,
            value: "",
            validations: [Validators.required,], display: true,
            col: 6
          },
          {
            type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
            options: [],
            validations: [Validators.required], display: true,
            col: 6
          },
          {
            type: 'text', label: 'Periodicidad del beneficio', name: 'periodicidad_beneficio',
            validations: [], display: true,
            col: 6
          },
          {
            type: 'text', label: 'regimen', name: 'regimen',
            readOnly: true,
            value: "",
            validations: [], display: true,
            col: 6
          },
          {
            type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
            options: [{ label: 'APROBADO', value: 'APROBADO' }, { label: 'RECHAZADO', value: 'RECHAZADO' }],
            validations: [Validators.required], display: true,
            col: 12
          },
          {
            type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aprobadas', validations: [Validators.min(1)], display: false,
            col: 6
          },
          {
            type: 'number', label: 'Dias de la última renta', name: 'ultimo_dia_ultima_renta', validations: [
              Validators.min(0),
              Validators.max(31),
            ], display: false,
            col: 6
          },
          {
            type: 'number', label: 'Monto correspondiente a los dias restantes', name: 'monto_ultima_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false,
            col: 6
          },
          { type: 'number', label: 'Monto mensual', name: 'monto_por_periodo', validations: [Validators.min(0), montoTotalValidator()], display: false, },
          { type: 'number', label: 'Número de rentas a pagar en el primer pago', name: 'num_rentas_pagar_primer_pago', validations: [Validators.min(1)], display: false },
          { type: 'number', label: 'monto retroactivo', name: 'monto_retroactivo', validations: [Validators.min(0), montoTotalValidator()], display: false, },
          { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false, },
          { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.min(0), montoTotalValidator()], display: false, },
          {
            type: 'date',
            label: 'Fecha de efectividad',
            name: 'fecha_efectividad',
            max: new Date().toISOString().split('T')[0],
            validations: [Validators.required, noFutureDateValidator],
            display: true,
            col: 4
          },
          {
            type: 'text',
            label: 'Última Fecha de pago',
            name: 'periodo_finalizacion',
            validations: [],
            display: false,
            col: 4
          },
          {
            type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true,
            col: 4
          },

        ];
        //options.beneficios = temp;
        //return temp;
      }

      this.mostrarDB = true;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      return null;  // En caso de error, retornar null o manejar el error como sea necesario
    }
    return null; // Ensure there's always a return value


  };

  getTipoBenBeneficiarios = async (tipoPers: any) => {
    this.tipoPersona = tipoPers
    try {

      const beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(tipoPers).toPromise();
      // Mapea los beneficios para generar una lista
      let temp = beneficios.map((item: any) => {
        return {
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen
        };
      });

      // Actualiza las configuraciones de los campos del formulario (myFormFields2)
      this.myFormFields2 = [
        /* { type: 'text', label: 'DNI del beneficiario', name: 'dni', value: "", validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, readOnly: true },
         */
        /* {
          type: 'dropdown', label: 'Tipo persona', name: 'tipo_persona',
          options: [{ label: `${tipoPers}`, value: `${tipoPers}` }],
          validations: [Validators.required], display: true
        }, */
        {
          type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
          options: temp,
          validations: [Validators.required], display: true,
          col: 6
        },
        {
          type: 'text', label: 'Número de expediente', name: 'n_expediente',
          readOnly: false,
          value: "",
          validations: [Validators.required,], display: true,
          col: 6
        },
        {
          type: 'date',
          label: 'Fecha de presentación',
          name: 'fecha_presentacion',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true,
          col: 6
        },
        {
          type: 'text', label: 'Periodicidad del beneficio', name: 'periodicidad_beneficio',
          validations: [], display: true,
          col: 6
        },
        {
          type: 'text', label: 'regimen', name: 'regimen',
          readOnly: true,
          value: "",
          validations: [], display: true,
        },
        {
          type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aprobadas', validations: [Validators.min(1), noDecimalValidator()], display: false,
          col: 6
        },
        {
          type: 'number', label: 'Monto mensual del beneficio', name: 'monto_por_periodo', validations: [Validators.min(0), montoTotalValidator()], display: false,
          col: 6
        },
        {
          type: 'number', label: 'Dias de la última renta', name: 'ultimo_dia_ultima_renta', validations: [
            Validators.min(1),
            Validators.max(31),
          ], display: false,
          col: 6
        },
        {
          type: 'number', label: 'Monto última renta', name: 'monto_ultima_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false,
          col: 6
        },

        {
          type: 'date',
          label: 'Fecha de efectividad',
          name: 'fecha_efectividad',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true,
          col: 6
        },
        {
          type: 'text',
          label: 'Última Fecha de pago',
          name: 'periodo_finalizacion',
          validations: [],
          display: false,
          col: 6
        },

        {
          type: 'number', label: 'Número de rentas a pagar en la primera cuota', name: 'num_rentas_pagar_primer_pago', validations: [Validators.min(1)], display: false,
          col: 4
        },

        {
          type: 'number', label: 'monto_retroactivo', name: 'monto_retroactivo', validations: [Validators.min(0), montoTotalValidator()], display: false,
          col: 4
        },
        {
          type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false,
          col: 4
        },

        {
          type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
          options: [{ label: 'APROBADO', value: 'APROBADO' }, { label: 'RECHAZADO', value: 'RECHAZADO' }], validations: [Validators.required], display: true
        },

        {
          type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.min(0), montoTotalValidator()], display: false,
          col: 6
        },

        {
          type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true,
          col: 6
        },
      ];

      // Muestra el formulario después de configurar los campos
      //this.mostrarDB = true;

      // Retorna la lista de beneficios mapeados
      return temp;

    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      return null;  // En caso de error, retornar null o manejar el error como sea necesario
    }
  };

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  buscarPeriodicidad(arreglo: any, etiqueta: any) {
    // Iterar sobre cada elemento del arreglo
    for (let i = 0; i < arreglo.length; i++) {
      // Verificar si la etiqueta coincide
      if (etiqueta == arreglo[i].label) {
        if (arreglo[i].periodicidad == "V") {
          // Si coincide, retornar la periodicidad
          return arreglo[i].periodicidad;
        }
      }
    }
  }

  getFilas = async () => {
    if (this.Afiliado.fallecido == "SI" && (this.Afiliado.tipo_persona == 'AFILIADO' ||
      this.Afiliado.tipo_persona == 'JUBILADO' ||
      this.Afiliado.tipo_persona == 'PENSIONADO')) {
      try {
        await this.getColumns();
        const data = await this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).toPromise();

        this.filas = data.map((item: any) => ({
          id_persona: item.id_persona,
          id_causante: item.id_causante,
          id_detalle_persona: item.id_detalle_persona,
          dni: item.n_identificacion,
          nombre_completo: this.unirNombres(item.primer_apellido, item.segundo_apellido, item.primer_nombre, item.segundo_nombre, item.tercer_nombre),
          genero: item.genero,
          tipo_afiliado: item.tipo_persona,
          porcentaje: item.porcentaje,
          observacion_detalle_persona: item.observacion_detalle_persona,
          estado_afil_detalle_persona: item.estado_afil_detalle_persona,
        }));

        /* const data1 = await this.svcAfilServ.obtenerBeneficiosDeAfil(this.form.value.dni).toPromise();
        this.filasBeneficios = data1.map((item: any) => ({
          id_beneficio: item.id_beneficio,
          monto_total: item.monto_total,
          nombre_beneficio: item.nombre_beneficio,
          num_rentas_aprobadas: item.num_rentas_aprobadas,
          numero_rentas_max: item.numero_rentas_max
        })); */
        //this.cargar();

        return data;
      } catch (error) {
        console.error("Error al obtener datos de beneficios", error);
        throw error;
      }
    }
  };

  transformarObjeto(objeto: any): any {
    if (objeto) {
      return Object?.keys(objeto).map(key => {
        return {
          header: key,
          col: key,
          isEditable: false,
        };
      });
    }
  }

  getColumns = async () => {
    try {
      this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).subscribe(
        async (response) => {
          const primerObjetoTransformado = this.transformarObjeto(response[0]);
          this.myColumns = [
            { header: 'N° Identificación', col: 'dni', },
            {
              header: 'Nombre Completo',
              col: 'nombre_completo',

            },
            { header: 'Género', col: 'genero', },
            {
              header: 'Tipo Afiliado',
              col: 'tipo_afiliado',

            },
            { header: 'Porcentaje', col: 'porcentaje', },
          ];
        },
        (_error) => {
        })
    } catch (error) {
      console.log(error);
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  async manejarRowClick(row: any) {
    this.limpiarFormulario()
    try {
      // Obtiene los beneficios basados en el tipo de afiliado seleccionado
      if (row.tipo_afiliado === "BENEFICIARIO") {
        const temp = await this.getTipoBenBeneficiarios(row.tipo_afiliado);
        //this.toastr.warning(`La persona se encuentra como beneficiario.No se puede asignar beneficios a los beneficiarios del mismo causante, solo a los designados`, "Advertencia");
      }
      const temp = await this.getTipoBenBeneficiarios(row.tipo_afiliado);

      if (!temp || temp.length === 0) {
        this.mostrarB = false;  // No mostrar el formulario de beneficios
        return;  // Detener la ejecución
      } else {
        this.desOBenSeleccionado = row;
        // Si hay beneficios, proceder con la lógica y mostrar el formulario
        this.myFormFields2[0].value = row.dni;
        this.mostrarB = true;
      }


    } catch (error) {
      console.error('Error al manejar la fila seleccionada:', error);
    }
  }

  async prueba(event: any): Promise<any> {
    if (event.fieldName === "tipo_persona") {
      this.tipoPersonaSelected = event.value;

      if (["JUBILADO", "PENSIONADO", "AFILIADO"].includes(this.tipoPersonaSelected)) {
        let beneficios = await this.obtenerTipoBeneficioByTipoPersona(this.tipoPersonaSelected);

        // Filtrar si es AFILIADO y excluir "COSTO DE VIDA"
        if (this.tipoPersonaSelected === "AFILIADO") {
          beneficios = beneficios.filter((item: any) => item.beneficio.nombre_beneficio !== "COSTO DE VIDA");
        }

        // Mapear beneficios
        this.beneficios = beneficios.map((item: any) => ({
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio?.regimen,
        }));

        this.myFormFields1[3].options = this.beneficios;
      }

      // Resetear formularios
      const camposReset = [
        "fecha_presentacion", "n_expediente", "nombre_beneficio", "num_rentas_pagar_primer_pago", "periodicidad_beneficio", "regimen",
        "estado_solicitud", "num_rentas_aprobadas", "ultimo_dia_ultima_renta", "monto_total",
        "monto_por_periodo", "monto_primera_cuota", "monto_retroactivo", "monto_ultima_cuota", "fecha_efectividad",
        "periodo_finalizacion", "observacion"
      ];

      for (const campo of camposReset) {
        this.form1?.get(campo)?.setValue(null);
        this.FormBen?.get(campo)?.setValue(null);
      }

    } else if (event.fieldName === "nombre_beneficio") {
      this.tipoBenefSelected = event.value;

      // Resetear solo los campos específicos
      const camposBeneficioReset = [
        "estado_solicitud", "num_rentas_aprobadas", "ultimo_dia_ultima_renta", "monto_total", "num_rentas_pagar_primer_pago",
        "monto_por_periodo", "monto_primera_cuota", "monto_retroactivo", "monto_ultima_cuota", "fecha_efectividad",
        "periodo_finalizacion", "observacion"
      ];

      for (const campo of camposBeneficioReset) {
        this.form1?.get(campo)?.setValue(null);
        this.FormBen?.get(campo)?.setValue(null);
      }

      if (this.tipoPersonaSelected) {
        let beneficios = await this.obtenerTipoBeneficioByTipoPersona(this.tipoPersonaSelected);
        this.beneficios = beneficios.map((item: any) => ({
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen
        }));
      } else {
        let beneficios = await this.obtenerTipoBeneficioByTipoPersona(this.Afiliado.tipo_persona);
        this.beneficios = beneficios.map((item: any) => ({
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen
        }));
      }

      this.temp(event, this.beneficios, this.tipoBenefSelected);
      //this.calculoFechasMontos()
    }
  }

  async prueba1(event: any): Promise<any> {
    if (event.fieldName == "nombre_beneficio") {
      let ben = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(this.desOBenSeleccionado.tipo_afiliado).toPromise();
      this.beneficios = ben.map((item: any) => {
        return {
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen
        };
      });

      this.tipoBenefSelected = event.value;
      // Resetear solo los campos específicos
      const camposBeneficioReset = [
        "fecha_presentacion", "n_expediente", "estado_solicitud", "num_rentas_aprobadas", "ultimo_dia_ultima_renta", "monto_total",
        "monto_por_periodo", "monto_primera_cuota", "monto_retroactivo", "monto_ultima_cuota", "fecha_efectividad",
        "periodo_finalizacion", "observacion"
      ];

      for (const campo of camposBeneficioReset) {
        this.form1?.get(campo)?.setValue(null);
        this.FormBen?.get(campo)?.setValue(null);
      }
      this.temp(event, this.beneficios, this.tipoBenefSelected);
    }
  }

  calculoFechasMontos(datosFormateados: any) {
    if (datosFormateados.monto_por_periodo && datosFormateados.num_rentas_aprobadas) {
      let montoultimacuota = datosFormateados.monto_ultima_cuota
        ? parseFloat(datosFormateados.monto_ultima_cuota)
        : 0;
      const result = (parseFloat(datosFormateados.monto_por_periodo) * parseFloat(datosFormateados.num_rentas_aprobadas)) + montoultimacuota

      this.FormBen?.get("monto_total")?.setValue(result.toFixed(2));
      this.form1?.get("monto_total")?.setValue(result.toFixed(2));
    }

    let num_rentas_pagar_primer_pago: number = datosFormateados.num_rentas_pagar_primer_pago ? Number(datosFormateados.num_rentas_pagar_primer_pago) || 0.00 : 0.00;
    let monto_por_periodo: number = datosFormateados.monto_por_periodo ? Number(datosFormateados.monto_por_periodo) || 0.00 : 0.00;
    let monto_retroactivo: number = datosFormateados.monto_retroactivo ? Number(datosFormateados.monto_retroactivo) || 0.00 : 0.00;


    if ((datosFormateados.num_rentas_pagar_primer_pago && datosFormateados.monto_por_periodo) || datosFormateados.monto_retroactivo) {

      let monto_por_periodo: number = parseFloat(datosFormateados.monto_por_periodo)
        ? parseFloat(datosFormateados.monto_por_periodo)
        : 0;

      let monto_retroactivo: number = parseFloat(datosFormateados.monto_retroactivo)
        ? parseFloat(datosFormateados.monto_retroactivo)
        : 0;

      const result2 = parseFloat(datosFormateados.num_rentas_pagar_primer_pago) * monto_por_periodo + monto_retroactivo;
      this.form1?.get("monto_primera_cuota")?.setValue(result2.toFixed(2));
      this.FormBen?.get("monto_primera_cuota")?.setValue(result2.toFixed(2));
    }


    let fechaFormateada

    if (datosFormateados.periodicidad_beneficio == "V") {
      fechaFormateada = '01/01/2500';
    } else if (datosFormateados.periodicidad_beneficio == "P") {

      //CALCULO DE FECHAS
      if (datosFormateados.fecha_efectividad) {
        // Calcular `periodo_finalizacion` basado en `fecha_efectividad`
        let startDate: Date = new Date();
        if (datosFormateados.num_rentas_aprobadas !== undefined) {
          // Ajustar la fecha al próximo mes y día especificado
          if (datosFormateados.fecha_efectividad) {
            if (typeof datosFormateados.fecha_efectividad === 'string') {
              startDate = parseISO(datosFormateados.fecha_efectividad);
            } else if (datosFormateados.fecha_efectividad instanceof Date) {
              startDate = datosFormateados.fecha_efectividad;
            } else {
              console.error('El formato de fecha no es válido.');
              return;
            }
          }

          // Asegúrate de que el número de meses no sea negativo
          let meses: number = Math.max(datosFormateados.num_rentas_aprobadas - 1, 0);

          const endDateWithMonths = addMonths(startDate, meses);

          let endDateAdjusted: Date | null = null;

          const endOfMonthDate = endOfMonth(endDateWithMonths); // Último día del mes resultante
          let localEndOfMonthDate = new Date(endOfMonthDate.getTime() - (endOfMonthDate.getTimezoneOffset() * 60000));

          const lastDay = parseInt(datosFormateados.ultimo_dia_ultima_renta, 10);

          datosFormateados.monto_ultima_cuota = (datosFormateados.monto_ultima_cuota === null) ? "" : datosFormateados.monto_ultima_cuota;
          datosFormateados.ultimo_dia_ultima_renta = (datosFormateados.ultimo_dia_ultima_renta === null) ? "" : datosFormateados.ultimo_dia_ultima_renta;

          if ((datosFormateados.monto_ultima_cuota === '' || datosFormateados.monto_ultima_cuota === 0) && (datosFormateados.ultimo_dia_ultima_renta === '' || datosFormateados.ultimo_dia_ultima_renta === 0)) {
            endDateAdjusted = localEndOfMonthDate;

          } else if ((datosFormateados.monto_ultima_cuota !== '' && datosFormateados.monto_ultima_cuota !== 0) && (datosFormateados.ultimo_dia_ultima_renta !== '' && datosFormateados.ultimo_dia_ultima_renta !== 0)) {

            let tem = new Date(endDateWithMonths);
            tem.setMonth(tem.getMonth() + 1);
            endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth(), lastDay + 1);
          }

          else if (datosFormateados.monto_ultima_cuota !== '' && datosFormateados.monto_ultima_cuota !== 0) {
            let endDateWithMonths = addMonths(startDate, meses + 1);
            let tem = new Date(endDateWithMonths);
            tem.setMonth(tem.getMonth() + 1);
            endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth());

          }

          else if (datosFormateados.ultimo_dia_ultima_renta !== '' && datosFormateados.ultimo_dia_ultima_renta !== 0) {
            let endDateWithMonths = addMonths(startDate, meses + 1);
            let tem = new Date(endDateWithMonths);
            tem.setMonth(tem.getMonth());
            endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth(), lastDay + 1);
          }

          // Verificar que endDateAdjusted no sea null antes de formatear
          if (endDateAdjusted) {
            // Ajustar la fecha a la zona horaria local
            let temp = new Date(endDateAdjusted.getTime() - (endDateAdjusted.getTimezoneOffset() * 60000));
            fechaFormateada = format(temp, 'dd/MM/yyyy');
          }
        }
      }
    }

    if (fechaFormateada != undefined) {
      //this.form1?.get("periodo_finalizacion")?.setValue(fechaFormateada);
      this.FormBen?.get("periodo_finalizacion")?.setValue(fechaFormateada);
      this.datosFormateados = datosFormateados
      this.datosFormateados.periodo_finalizacion = fechaFormateada
    }
  }

  async obtenerDatos1(event: any): Promise<any> {
    this.form1 = event;
    const datosFormateados = {
      ...event.value
    };
    this.calculoFechasMontos(datosFormateados);

  }

  async obtenerDatosFormBen(event: any): Promise<any> {
    this.FormBen = event;
    const datosFormateados = {
      ...event.value
    };
    this.calculoFechasMontos(datosFormateados);
  }

  setFieldValue(formFields: any[], fieldName: string, property: string, value: any) {
    const field = formFields.find(f => f.name === fieldName);
    if (field) {
      field[property] = value;
    }
  }

  temp(_data: any, beneficios: any, tipoBenefSelected?: any) {
    if (tipoBenefSelected) {
      for (let i of beneficios) {
        if (i.value == tipoBenefSelected) {
          if (this.myFormFields1.length > 0) {

            this.form1?.get("periodicidad_beneficio")?.setValue(i.periodicidad);
            this.setFieldValue(this.myFormFields1, 'periodicidad_beneficio', 'readOnly', true);
            this.form1?.get("regimen")?.setValue(i?.regimen?.ley);

            if (i?.periodicidad == "P") {
              this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', true);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'display', true);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'readOnly', true);
              this.setFieldValue(this.myFormFields1, 'num_rentas_aprobadas', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'display', true);

              if (i.numero_rentas_max == 1) {
                this.form1.get('monto_total')?.setValidators([]);
                this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', false);
                this.setFieldValue(this.myFormFields1, 'num_rentas_aprobadas', 'readOnly', true);
                this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', false);
                this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_retroactivo', 'display', false);

                this.form1.get("num_rentas_aprobadas")?.setValue(1);
                this.form1.get('monto_total')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);
                this.form1.get('monto_total')?.updateValueAndValidity();

                this.form1.get('monto_retroactivo')?.clearValidators();
                this.form1.get('monto_por_periodo')?.clearValidators();
                this.form1.get('num_rentas_pagar_primer_pago')?.clearValidators();

                this.form1.get('monto_retroactivo')?.updateValueAndValidity();
                this.form1.get('monto_por_periodo')?.updateValueAndValidity();
                this.form1.get('num_rentas_pagar_primer_pago')?.updateValueAndValidity();

              } else if (i.numero_rentas_max > 1 || i.numero_rentas_max == 0) {
                this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', true);
                this.setFieldValue(this.myFormFields1, 'num_rentas_aprobadas', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', true);
                this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'monto_retroactivo', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_retroactivo', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', true);
                // Eliminar validaciones de monto_total
                this.form1.get('monto_total')?.clearValidators();
                this.form1.get('monto_total')?.updateValueAndValidity();

                this.form1.get('monto_retroactivo')?.clearValidators();
                this.form1.get('monto_retroactivo')?.updateValueAndValidity();
                this.form1.get('monto_por_periodo')?.clearValidators();
                this.form1.get('monto_por_periodo')?.updateValueAndValidity();
                this.form1.get('num_rentas_pagar_primer_pago')?.clearValidators();
                this.form1.get('num_rentas_pagar_primer_pago')?.updateValueAndValidity();
              }

            } else if (i?.periodicidad == "V") {

              this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', true);
              this.setFieldValue(this.myFormFields1, 'num_rentas_aprobadas', 'display', false);
              this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', false);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'display', false);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', false);
              this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'readOnly', true);
              this.setFieldValue(this.myFormFields1, 'monto_retroactivo', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_retroactivo', 'readOnly', false);
              this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', false);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'display', false);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'readOnly', false);

              this.form1.get('monto_total')?.clearValidators();
              this.form1.get('monto_total')?.updateValueAndValidity();
              console.log(this.form1);

              this.form1.get('num_rentas_pagar_primer_pago')?.setValidators([Validators.required, Validators.min(1)]);
              this.form1.get('monto_por_periodo')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);
              this.form1.get('monto_retroactivo')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);

              this.form1.get('num_rentas_pagar_primer_pago')?.updateValueAndValidity();
              this.form1.get('monto_por_periodo')?.updateValueAndValidity();
              this.form1.get('monto_retroactivo')?.updateValueAndValidity();
            }


          } else if (this.myFormFields2.length > 0) {
            this.FormBen.get("periodicidad_beneficio")?.setValue(i?.periodicidad);
            this.setFieldValue(this.myFormFields2, 'periodicidad_beneficio', 'readOnly', true);
            this.FormBen.get("regimen")?.setValue(i.regimen.ley);

            if (i.periodicidad == "P") {
              this.setFieldValue(this.myFormFields2, 'num_rentas_aprobadas', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'display', true);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'display', true);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'readOnly', true);

              if (i.numero_rentas_max == 1) {
                this.FormBen.get("num_rentas_aprobadas")?.setValue(1);
                this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', false);
                this.setFieldValue(this.myFormFields2, 'num_rentas_aprobadas', 'readOnly', true);
                this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', false);
                this.FormBen.get('monto_total')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);
                this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_retroactivo', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_ultima_cuota', 'display', false);
                this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'display', false);

              } else if (i.numero_rentas_max > 1 || i.numero_rentas_max == 0) {
                this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', true);
                this.FormBen.get('num_rentas_pagar_primer_pago')?.setValidators([Validators.required, Validators.min(1)]);

                this.setFieldValue(this.myFormFields2, 'num_rentas_aprobadas', 'readOnly', false);
                this.FormBen.get('num_rentas_aprobadas')?.setValidators([Validators.required, Validators.min(1)]);

                this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', true);
                this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', true);
                this.FormBen.get('monto_por_periodo')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);

                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'readOnly', true);
                this.setFieldValue(this.myFormFields2, 'monto_retroactivo', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_retroactivo', 'readOnly', false);
                this.setFieldValue(this.myFormFields2, 'monto_ultima_cuota', 'display', true);
              }

            } else if (i?.periodicidad == "V") {
              this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', true);
              this.FormBen.get('num_rentas_pagar_primer_pago')?.setValidators([Validators.required, Validators.min(1)]);
              this.setFieldValue(this.myFormFields2, 'num_rentas_aprobadas', 'display', false);
              this.FormBen.get('num_rentas_aprobadas')?.setValidators([Validators.required, Validators.min(1)]);
              this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', false);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'display', false);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', false);
              this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', true);
              this.FormBen.get('monto_por_periodo')?.setValidators([Validators.required, Validators.min(0), montoTotalValidator()]);
              this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'readOnly', true);
              this.setFieldValue(this.myFormFields2, 'monto_retroactivo', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_retroactivo', 'readOnly', false);
              this.setFieldValue(this.myFormFields2, 'monto_ultima_cuota', 'display', false);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'display', false);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'readOnly', false);
            }
          }
        }
      }
    }
  }

  async guardarNTBenef() {
    /* Asignar al afiliado si no ha fallecido */
    /* Asignar a los beneficiarios si el afiliado ya falleció */
    //AFILIADOS O BENEFICIARIOS
    if (this.Afiliado.fallecido != "SI") {
      this.datosFormateados["dni"] = this.form?.value.dni;
      if (this.Afiliado.tipo_persona == 'JUBILADO' && (!this.desOBenSeleccionado || this.desOBenSeleccionado == undefined) || this.Afiliado.tipo_persona == 'PENSIONADO') {
        this.datosFormateados.tipo_persona = this.Afiliado.tipo_persona
      }
      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.desOBenSeleccionado).subscribe(
        {
          next: (_response) => {
            this.toastr.success("se asignó correctamente el beneficio");
            this.limpiarFormulario()
          },
          error: (error) => {
            let mensajeError = '';
            this.limpiarFormulario()
            // Verifica si el error tiene una estructura específica
            if (error.error.message) {
              mensajeError = error.error.message;
            }
            this.toastr.error(mensajeError);
          }
        })

    } else {
      // PARA LOS DESIGNADOS BENEFICIARIOS
      this.datosFormateados["dni"] = this.FormBen.value.dni;
      this.datosFormateados["periodo_finalizacion"] = this.FormBen.value.periodo_finalizacion;
      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.desOBenSeleccionado, this.Afiliado.id_persona).subscribe(
        {
          next: (_response) => {
            this.mostrarB = false;
            this.toastr.success("se asignó correctamente el beneficio");
            this.getFilas().then(() => this.cargar());
            this.limpiarFormulario();
          },
          error: (error) => {
            //this.limpiarFormulario();
            let mensajeError = '';
            // Verifica si el error tiene una estructura específica
            if (error.error.message) {
              mensajeError = error.error.message;
            }
            this.toastr.error(mensajeError);
          }
        })
    }
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    //this.Afiliado = [];

    this.tipoPersonaSelected = null
    this.tipoBenefSelected = null
    this.desOBenSeleccionado = null
    this.datosFormateados = null

    if (this.form1) {
      this.form1.reset();
    }
    if (this.FormBen) {
      this.FormBen.reset();
    }
    if (this.dynamicForm) {
      //this.dynamicForm.form.reset();
    }
  }

}
