import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { addDays, addMonths, format } from 'date-fns';
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
                this.getTipoBen(item?.tipo_persona);
              } if (item.tipo_persona == 'AFILIADO' && (item.estado_persona == 'INACTIVO')) {
                this.toastr.warning(`La persona se encuentra ${item.estado_persona}. No se puede asignar beneficios a los Afiliados ${item.estado_persona}`, "Advertencia");
              } if (item.tipo_persona == 'JUBILADO' || item.tipo_persona == 'PENSIONADO') {
                this.getTipoBen(item?.tipo_persona);
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

  getTipoBen = async (tipoPers: any) => {
    try {
      let beneficios = []
      this.myFormFields1 = [
        {
          type: 'dropdown', label: 'Tipo persona', name: 'tipo_persona',
          options: this.tiposPersona,
          validations: [], display: false
        },
        {
          type: 'date',
          label: 'Fecha de presentacion',
          name: 'fecha_presentacion',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        {
          type: 'text', label: 'Número de expediente', name: 'n_expediente',
          readOnly: false,
          value: "",
          validations: [Validators.required,], display: true,
        },
        {
          type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
          options: [],
          validations: [Validators.required], display: true
        },
        {
          type: 'text', label: 'Periodicidad del beneficio', name: 'periodicidad_beneficio',
          validations: [], display: true
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
          validations: [Validators.required], display: true
        },
        { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1)], display: false },
        {
          type: 'number', label: 'Dias de la última renta', name: 'ultimo_dia_ultima_renta', validations: [
            Validators.min(0),
            Validators.max(31),
          ], display: false
        },
        { type: 'number', label: 'Número de rentas a pagar en el primer pago', name: 'num_rentas_pagar_primer_pago', validations: [Validators.min(1)], display: false },
        { type: 'number', label: 'Monto correspondiente a los dias restantes', name: 'monto_ultima_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false },
        { type: 'number', label: 'Monto mensual', name: 'monto_por_periodo', validations: [Validators.min(0), montoTotalValidator()], display: false, },
        { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false, },
        { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.min(0), montoTotalValidator()], display: false, },
        {
          type: 'date',
          label: 'Fecha de efectividad',
          name: 'fecha_calculo',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        {
          type: 'text',
          label: 'Última Fecha de pago',
          name: 'periodo_finalizacion',
          validations: [],
          display: false
        },
        { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },

      ];

      if (this.Afiliado.tipo_persona == "JUBILADO" || this.Afiliado.tipo_persona == "PENSIONADO") {
        beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(this.Afiliado.tipo_persona).toPromise();
        this.myFormFields1[0].options = [{ label: this.Afiliado.tipo_persona, value: this.Afiliado.tipo_persona }];
        this.myFormFields1[0].display = true;

        let temp = beneficios
          .map((item: any) => {
            if (item.beneficio.nombre_beneficio === "COSTO DE VIDA") {
              return {
                label: item.beneficio.nombre_beneficio,
                value: item.beneficio.nombre_beneficio,
                periodicidad: item.beneficio.periodicidad,
                numero_rentas_max: item.beneficio.numero_rentas_max,
                regimen: item.beneficio?.regimen?.ley
              };
            }
            return null; // Devuelve null explícitamente para cumplir con la expectativa de retorno.
          })
          .filter((item: any) => item !== null); // Elimina valores nulos del resultado.
        this.mostrarDB = false;
        return temp;


      } else if (this.Afiliado.tipo_persona == "AFILIADO") {
        if (this.tipoPersonaSelected) {
          beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(this.tipoPersonaSelected).toPromise();
        } else if (!this.tipoPersonaSelected) {
          beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(this.Afiliado.tipo_persona).toPromise();
        }

        this.myFormFields1[0].options = this.tiposPersona;
        this.myFormFields1[0].display = true;

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
        return temp;
      }
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      return null;  // En caso de error, retornar null o manejar el error como sea necesario
    }
  };

  getTipoBenBeneficiarios = async (tipoPers: any) => {
    console.log(tipoPers);

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
        {
          type: 'dropdown', label: 'Tipo persona', name: 'tipo_persona',
          options: [{ label: `${tipoPers}`, value: `${tipoPers}` }],
          validations: [Validators.required], display: true
        },
        {
          type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
          options: temp,
          validations: [Validators.required], display: true
        },
        {
          type: 'text', label: 'Número de expediente', name: 'n_expediente',
          readOnly: false,
          value: "",
          validations: [Validators.required,], display: true,
        },
        {
          type: 'date',
          label: 'Fecha de presentación',
          name: 'fecha_presentacion',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        {
          type: 'text', label: 'Periodicidad del beneficio', name: 'periodicidad_beneficio',
          validations: [], display: true
        },
        {
          type: 'text', label: 'regimen', name: 'regimen',
          readOnly: true,
          value: "",
          validations: [], display: true,
        },
        { type: 'number', label: 'Monto mensual del beneficio', name: 'monto_por_periodo', validations: [Validators.min(0), montoTotalValidator()], display: false, },
        { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1), noDecimalValidator()], display: false },
        {
          type: 'number', label: 'Dias de la última renta', name: 'ultimo_dia_ultima_renta', validations: [
            Validators.min(0),
            Validators.max(31),
          ], display: false
        },
        { type: 'number', label: 'Monto última renta', name: 'monto_ultima_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false },

        {
          type: 'date',
          label: 'Fecha de efectividad',
          name: 'fecha_calculo',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        {
          type: 'text',
          label: 'Última Fecha de pago',
          name: 'periodo_finalizacion',
          validations: [],
          display: false
        },

        { type: 'number', label: 'Número de rentas a pagar en la primera cuota', name: 'num_rentas_pagar_primer_pago', validations: [Validators.min(1)], display: false },

        { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.min(0), montoTotalValidator()], display: false, },

        {
          type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
          options: [{ label: 'APROBADO', value: 'APROBADO' }, { label: 'RECHAZADO', value: 'RECHAZADO' }], validations: [Validators.required], display: true
        },

        { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.min(0), montoTotalValidator()], display: false, },

        { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },
      ];

      // Muestra el formulario después de configurar los campos
      this.mostrarDB = true;

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
    //console.log("ENTRO");
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
          num_rentas_aplicadas: item.num_rentas_aplicadas,
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
        (error) => {
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

    if (event.fieldName == "tipo_persona") {
      this.tipoPersonaSelected = event.value;
      //this.tiposPersona = event.value;

      if (this.Afiliado.tipo_persona == "JUBILADO" || this.Afiliado.tipo_persona == "PENSIONADO") {
        let ben = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(event.value).toPromise();
        let temp = ben
          .map((item: any) => {

            if (item.beneficio.nombre_beneficio === "COSTO DE VIDA" || item.beneficio.nombre_beneficio === "AUXILIO POR INVALIDEZ (PAGO UNICO)") {
              return {
                label: item.beneficio.nombre_beneficio,
                value: item.beneficio.nombre_beneficio,
                periodicidad: item.beneficio.periodicidad,
                numero_rentas_max: item.beneficio.numero_rentas_max,
                regimen: item.beneficio?.regimen
              };
            }
            return null; // Devuelve null explícitamente para cumplir con la expectativa de retorno.
          })
          .filter((item: any) => item !== null); // Elimina valores nulos del resultado.

        this.beneficios = temp
      } else if (this.Afiliado.tipo_persona == "AFILIADO") {
        let ben = await this.svcBeneficioServ.

          obtenerTipoBeneficioByTipoPersona(event.value).toPromise();
        this.beneficios = ben
          .filter((item: any) => item.beneficio.nombre_beneficio !== "COSTO DE VIDA")
          .map((item: any) => {
            return {
              label: item.beneficio.nombre_beneficio,
              value: item.beneficio.nombre_beneficio,
              periodicidad: item.beneficio.periodicidad,
              numero_rentas_max: item.beneficio.numero_rentas_max,
              regimen: item.beneficio?.regimen
            };
          });
      }

      this.myFormFields1[3].options = this.beneficios;
      this.form1.get("nombre_beneficio")?.setValue(null)
      this.form1.get("num_rentas_pagar_primer_pago")?.setValue(null)
      this.form1.get("periodicidad_beneficio")?.setValue(null)
      this.form1.get("regimen")?.setValue(null)
      this.form1?.get("estado_solicitud")?.setValue(null)
      this.form1?.get("num_rentas_aplicadas")?.setValue(null)
      this.form1?.get("ultimo_dia_ultima_renta")?.setValue(null)
      this.form1?.get("monto_total")?.setValue(null)
      this.form1?.get("monto_por_periodo")?.setValue(null)
      this.form1?.get("monto_primera_cuota")?.setValue(null)
      this.form1?.get("monto_ultima_cuota")?.setValue(null)
      this.form1?.get("fecha_calculo")?.setValue(null)
      this.form1?.get("periodo_finalizacion")?.setValue(null)
      this.form1?.get("observacion")?.setValue(null)

      this.FormBen?.get("nombre_beneficio")?.setValue(null)
      this.FormBen?.get("num_rentas_pagar_primer_pago")?.setValue(null)
      this.FormBen?.get("periodicidad_beneficio")?.setValue(null)
      this.FormBen?.get("regimen")?.setValue(null)
      this.FormBen?.get("estado_solicitud")?.setValue(null)
      this.FormBen?.get("num_rentas_aplicadas")?.setValue(null)
      this.FormBen?.get("ultimo_dia_ultima_renta")?.setValue(null)
      this.FormBen?.get("monto_total")?.setValue(null)
      this.FormBen?.get("monto_por_periodo")?.setValue(null)
      this.FormBen?.get("monto_primera_cuota")?.setValue(null)
      this.FormBen?.get("monto_ultima_cuota")?.setValue(null)
      this.FormBen?.get("fecha_calculo")?.setValue(null)
      this.FormBen?.get("periodo_finalizacion")?.setValue(null)
      this.FormBen?.get("observacion")?.setValue(null)


    } else if (event.fieldName == "nombre_beneficio") {
      this.tipoBenefSelected = event.value;

      this.form1?.get("estado_solicitud")?.setValue(null)
      this.form1?.get("num_rentas_aplicadas")?.setValue(null)
      this.form1?.get("ultimo_dia_ultima_renta")?.setValue(null)
      this.form1?.get("monto_total")?.setValue(null)
      this.form1?.get("monto_por_periodo")?.setValue(null)
      this.form1?.get("monto_primera_cuota")?.setValue(null)
      this.form1?.get("monto_ultima_cuota")?.setValue(null)
      this.form1?.get("fecha_calculo")?.setValue(null)
      this.form1?.get("periodo_finalizacion")?.setValue(null)
      this.form1?.get("observacion")?.setValue(null)

      this.FormBen?.get("estado_solicitud")?.setValue(null)
      this.FormBen?.get("num_rentas_aplicadas")?.setValue(null)
      this.FormBen?.get("ultimo_dia_ultima_renta")?.setValue(null)
      this.FormBen?.get("monto_total")?.setValue(null)
      this.FormBen?.get("monto_por_periodo")?.setValue(null)
      this.FormBen?.get("monto_primera_cuota")?.setValue(null)
      this.FormBen?.get("monto_ultima_cuota")?.setValue(null)
      this.FormBen?.get("fecha_calculo")?.setValue(null)
      this.FormBen?.get("periodo_finalizacion")?.setValue(null)
      this.FormBen?.get("observacion")?.setValue(null)

      this.temp(event, this.beneficios, this.tipoBenefSelected);
    }

  }

  async prueba1(event: any): Promise<any> {
    if (event.fieldName == 'tipo_persona') {
      let ben = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(event.value).toPromise();
      this.beneficios = ben.map((item: any) => {
        return {
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen
        };
      });

      this.myFormFields2[1].options = this.beneficios;

    }

    if (event.fieldName == "nombre_beneficio") {
      this.tipoBenefSelected = event.value;

      this.temp(event, this.beneficios, this.tipoBenefSelected);
    }
  }

  async obtenerDatos1(event: any): Promise<any> {
    this.form1 = event;
    console.log(event);

    const datosFormateados = {
      ...event.value
    };
    console.log(this.datosFormateados);

    this.datosFormateados = datosFormateados;
    /* let montoPrimeraCuota = 0
    if (this.datosFormateados.num_rentas_pagar_primer_pago && this.datosFormateados.monto_por_periodo) {
      montoPrimeraCuota = this.datosFormateados.num_rentas_pagar_primer_pago * this.datosFormateados.monto_por_periodo
      this.form1?.get("monto_primera_cuota")?.setValue(montoPrimeraCuota.toFixed(2));
      this.FormBen?.get("monto_primera_cuota")?.setValue(montoPrimeraCuota.toFixed(2));
    } */

    if (this.datosFormateados.monto_por_periodo && this.datosFormateados.num_rentas_aplicadas) {
      const result =
        (
          parseFloat(this.datosFormateados.monto_por_periodo) *
          parseFloat(this.datosFormateados.num_rentas_aplicadas)
        )
        + parseFloat(this.datosFormateados.monto_ultima_cuota)
      console.log(result);

      this.FormBen?.get("monto_total")?.setValue(result.toFixed(2));
      this.form1?.get("monto_total")?.setValue(result.toFixed(2));
    }

    let fechaFormateada

    if (this.datosFormateados.periodicidad_beneficio == "V") {
      fechaFormateada = '01/01/2500';
    } else if (this.datosFormateados.periodicidad_beneficio == "P") {

      //CALCULO DE FECHAS
      if (this.datosFormateados.fecha_calculo) {
        if (this.datosFormateados?.num_rentas_aplicadas && this.datosFormateados?.ultimo_dia_ultima_renta && parseInt(this.datosFormateados?.num_rentas_aplicadas, 10) > 1) {

          // Convertimos `fecha_calculo` a `Date` para hacer los cálculos
          const startDate = new Date(this.datosFormateados.fecha_calculo);
          // Sumamos los meses especificados en `num_rentas_aplicadas`
          const endDateWithMonths = addMonths(startDate, parseInt(this.datosFormateados?.num_rentas_aplicadas, 10));
          // Configuramos la fecha al próximo mes y asignamos el día de `ultimo_dia_ultima_renta`
          const endDateAdjusted = new Date(endDateWithMonths.getFullYear(), endDateWithMonths.getMonth() + 1, parseInt(this.datosFormateados?.ultimo_dia_ultima_renta, 10));
          // Formateamos la fecha final
          fechaFormateada = format(endDateAdjusted, 'dd/MM/yyyy');

        } else if (parseInt(this.datosFormateados?.num_rentas_aplicadas, 10) == 1) {

          // Obtenemos la fecha en formato `Date` para sumar días y meses correctamente
          //const startDate = new Date(this.datosFormateados.fecha_calculo);
          // Primero, sumamos los meses
          //const endDateWithMonths = addMonths(startDate, parseInt(this.datosFormateados?.num_rentas_aplicadas, 10));
          // Luego, sumamos los días (en este caso, 0 días, pero puedes ajustar si necesitas)
          //const endDateWithDays = addDays(endDateWithMonths, 0);
          // Formateamos la fecha final
          //fechaFormateada = format(endDateWithDays, 'dd/MM/yyyy');
        }
      }
    }

    if (fechaFormateada != undefined) {
      this.form1?.get("periodo_finalizacion")?.setValue(fechaFormateada);
    }

  }

  async obtenerDatosFormBen(event: any): Promise<any> {
    this.FormBen = event;
    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;
    //let montoPrimeraCuota = 0

    if (this.datosFormateados.num_rentas_pagar_primer_pago && this.datosFormateados.monto_por_periodo) {
      //montoPrimeraCuota = this.datosFormateados.num_rentas_pagar_primer_pago * this.datosFormateados.monto_por_periodo
      //this.form1?.get("monto_primera_cuota")?.setValue(montoPrimeraCuota.toFixed(2));
      //this.FormBen?.get("monto_primera_cuota")?.setValue(montoPrimeraCuota.toFixed(2));
    }

    if (this.datosFormateados.monto_por_periodo && this.datosFormateados.num_rentas_aplicadas) {
      const result = (parseFloat(this.datosFormateados.monto_por_periodo) * parseFloat(this.datosFormateados.num_rentas_aplicadas)) + parseFloat(this.datosFormateados.monto_ultima_cuota)

      //const result = parseFloat(this.datosFormateados.monto_por_periodo) * parseFloat(this.datosFormateados.num_rentas_aplicadas)

      this.FormBen?.get("monto_total")?.setValue(result.toFixed(2));
    }

    let fechaFormateada


    //CALCULO DE FECHAS
    //const startDateFormatted = format(this.datosFormateados?.fecha_calculo, 'dd/MM/yyyy');

    if (this.datosFormateados.periodicidad_beneficio == "V") {
      fechaFormateada = '01/01/2500';
    } else if (this.datosFormateados.periodicidad_beneficio == "P") {
      //CALCULO DE FECHAS
      if (this.datosFormateados.fecha_calculo && parseInt(this.datosFormateados?.num_rentas_aplicadas, 10) > 1) {
        if (this.datosFormateados?.num_rentas_aplicadas && this.datosFormateados?.ultimo_dia_ultima_renta) {

          // Convertimos `fecha_calculo` a `Date` para hacer los cálculos
          const startDate = new Date(this.datosFormateados.fecha_calculo);
          // Sumamos los meses especificados en `num_rentas_aplicadas`
          const endDateWithMonths = addMonths(startDate, parseInt(this.datosFormateados?.num_rentas_aplicadas, 10));
          // Configuramos la fecha al próximo mes y asignamos el día de `ultimo_dia_ultima_renta`
          const endDateAdjusted = new Date(endDateWithMonths.getFullYear(), endDateWithMonths.getMonth(), parseInt(this.datosFormateados?.ultimo_dia_ultima_renta, 10));
          // Formateamos la fecha final
          fechaFormateada = format(endDateAdjusted, 'dd/MM/yyyy');

        } else if (parseInt(this.datosFormateados?.num_rentas_aplicadas, 10) == 1) {
          // Obtenemos la fecha en formato `Date` para sumar días y meses correctamente
          /* const startDate = new Date(this.datosFormateados.fecha_calculo); */
          // Primero, sumamos los meses
          /* const endDateWithMonths = addMonths(startDate, parseInt(this.datosFormateados?.num_rentas_aplicadas, 10)); */
          // Luego, sumamos los días (en este caso, 0 días, pero puedes ajustar si necesitas)
          /* const endDateWithDays = addDays(endDateWithMonths, 0); */
          // Formateamos la fecha final
          /* fechaFormateada = format(endDateWithDays, 'dd/MM/yyyy'); */
        }
      }
    }

    if (fechaFormateada != undefined) {
      this.FormBen?.get("periodo_finalizacion")?.setValue(fechaFormateada);
      this.FormBen?.get("periodo_finalizacion")?.setValue(fechaFormateada);
    }
  }

  setFieldValue(formFields: any[], fieldName: string, property: string, value: any) {
    const field = formFields.find(f => f.name === fieldName);
    if (field) {
      field[property] = value;
    }
  }

  temp(data: any, beneficios: any, tipoBenefSelected?: any) {
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
              this.setFieldValue(this.myFormFields1, 'num_rentas_aplicadas', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'display', true);

              if (i.numero_rentas_max == 1) {
                this.form1.get("num_rentas_aplicadas")?.setValue(1);
                this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', false);
                this.setFieldValue(this.myFormFields1, 'num_rentas_aplicadas', 'readOnly', true);
                this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', false);
                this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', false);
                this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', false);

              } else if (i.numero_rentas_max > 1 || i.numero_rentas_max == 0) {
                this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', true);
                this.setFieldValue(this.myFormFields1, 'num_rentas_aplicadas', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', true);
                this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', true);
                this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'readOnly', false);
                this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', true);
              }

            } else if (i?.periodicidad == "V") {
              this.setFieldValue(this.myFormFields1, 'num_rentas_pagar_primer_pago', 'display', true);
              this.setFieldValue(this.myFormFields1, 'num_rentas_aplicadas', 'display', false);
              this.setFieldValue(this.myFormFields1, 'ultimo_dia_ultima_renta', 'display', false);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'display', false);
              this.setFieldValue(this.myFormFields1, 'monto_total', 'readOnly', false);
              this.setFieldValue(this.myFormFields1, 'monto_por_periodo', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'display', true);
              this.setFieldValue(this.myFormFields1, 'monto_primera_cuota', 'readOnly', false);
              this.setFieldValue(this.myFormFields1, 'monto_ultima_cuota', 'display', false);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'display', false);
              this.setFieldValue(this.myFormFields1, 'periodo_finalizacion', 'readOnly', false);
            }

          } else if (this.myFormFields2.length > 0) {

            this.FormBen.get("periodicidad_beneficio")?.setValue(i?.periodicidad);
            this.setFieldValue(this.myFormFields2, 'periodicidad_beneficio', 'readOnly', true);
            this.FormBen.get("regimen")?.setValue(i.regimen.ley);

            if (i.periodicidad == "P") {
              this.setFieldValue(this.myFormFields2, 'num_rentas_aplicadas', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'display', true);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'display', true);
              this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'readOnly', true);

              if (i.numero_rentas_max == 1) {
                this.FormBen.get("num_rentas_aplicadas")?.setValue(1);
                this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', false);
                this.setFieldValue(this.myFormFields2, 'num_rentas_aplicadas', 'readOnly', true);
                this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', false);
                this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', false);
                this.setFieldValue(this.myFormFields2, 'monto_ultima_cuota', 'display', false);
                this.setFieldValue(this.myFormFields2, 'periodo_finalizacion', 'display', false);

              } else if (i.numero_rentas_max > 1 || i.numero_rentas_max == 0) {
                this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', true);
                this.setFieldValue(this.myFormFields2, 'num_rentas_aplicadas', 'readOnly', false);
                this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', true);
                this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', true);
                this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'readOnly', false);
                this.setFieldValue(this.myFormFields2, 'monto_ultima_cuota', 'display', true);
              }

            } else if (i?.periodicidad == "V") {
              this.setFieldValue(this.myFormFields2, 'num_rentas_pagar_primer_pago', 'display', true);
              this.setFieldValue(this.myFormFields2, 'num_rentas_aplicadas', 'display', false);
              this.setFieldValue(this.myFormFields2, 'ultimo_dia_ultima_renta', 'display', false);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'display', false);
              this.setFieldValue(this.myFormFields2, 'monto_total', 'readOnly', false);
              this.setFieldValue(this.myFormFields2, 'monto_por_periodo', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'display', true);
              this.setFieldValue(this.myFormFields2, 'monto_primera_cuota', 'readOnly', false);
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
    // console.log(this.datosFormateados);
    //AFILIADOS O BENEFICIARIOS

    if (this.Afiliado.fallecido != "SI") {
      this.datosFormateados["dni"] = this.form?.value.dni;
      this.datosFormateados["periodo_finalizacion"] = this.form?.value.periodo_finalizacion;

      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.desOBenSeleccionado).subscribe(
        {
          next: (response) => {
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
          next: (response) => {
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
    this.desOBenSeleccionado = []

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
