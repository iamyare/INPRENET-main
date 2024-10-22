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
  datosFormateados: any;
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
  filas: any
  ejecF: any;
  desOBenSeleccionado: any
  mostrarB: any;
  hasBeneficios: any = [];

  tiposPersona: any[] = [
    { label: "AFILIADO", value: 'AFILIADO' },
    { label: "JUBILADO", value: 'JUBILADO' },
    { label: "PENSIONADO", value: 'PENSIONADO' },
    { label: "VOLUNTARIO", value: 'VOLUNTARIO' }
  ];
  tipoPersonaSelected: any;
  tipoBenefSelected: any;
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

    this.Afiliado = { nameAfil: "" }

    if (this.form.value.dni) {
      this.svcAfilServ.getAfilByDni(this.form.value.dni).subscribe(
        async (res) => {

          this.hasBeneficios = res?.BENEFICIOS;
          if (res) {
            const item = {
              id_persona: res.ID_PERSONA,
              dni: res.N_IDENTIFICACION,
              fallecido: res.FALLECIDO,
              estado_persona: res.ESTADO_PERSONA,
              tipo_persona: res.TIPO_PERSONA,
              estado_civil: res.ESTADO_CIVIL,
              nombreCompleto: unirNombres(res.PRIMER_NOMBRE, res.SEGUNDO_NOMBRE, res.PRIMER_APELLIDO, res.SEGUNDO_APELLIDO),
              genero: res.GENERO,
              profesion: res.PROFESION,
              telefono_1: res.TELEFONO_1,
              colegio_magisterial: res.COLEGIO_MAGISTERIAL,
              numero_carnet: res.NUMERO_CARNET,
              direccion_residencia: res.DIRECCION_RESIDENCIA,
              estado: res.ESTADO,
              salario_base: res.SALARIO_BASE,
              fecha_nacimiento: convertirFecha(res.FECHA_NACIMIENTO, false),
              beneficios: res.BENEFICIOS
            };

            //const tipoPersona = item.fallecido === "SI" ? "BENEFICIARIO" : item.tipo_persona;


            if (item.fallecido === "NO") {
              if (item.estado_persona == 'ACTIVO') {
                this.getTipoBen(item.tipo_persona);
              } if (item.estado_persona == 'INACTIVO' || item.estado_persona == 'SUSPENDIDA' || item.estado_persona == 'NO REGISTRADO') {
                this.toastr.error(`La persona se encuentra ${item.estado_persona}`);
                this.toastr.warning(`No se puede asignar beneficios a los Afiliados ${item.estado_persona}`, "Advertencia");
              } if (item.tipo_persona == 'JUBILADO' || item.tipo_persona == 'PENSIONADO') {
                this.toastr.error(`La persona se encuentra: ${item.tipo_persona}`);
                this.toastr.warning(`No se puede asignar beneficios a la persona porque se encuentra: ${item.tipo_persona}`, "Advertencia");
              } if (item.tipo_persona == 'VOULUNTARIO') {
                this.toastr.error(`Este tipo de persona todavia no esta en funcionamiento: ${item.tipo_persona}`);
                this.toastr.warning(`Este tipo de persona todavia no esta en funcionamiento: ${item.tipo_persona}`, "Advertencia");
              } if (this.hasBeneficios.length > 0) {
                this.toastr.error(`ya cuenta con un beneficio`);
                this.toastr.warning(`ya cuenta con un beneficio`, "Advertencia");
              }
            }

            this.Afiliado = {
              ...item,
              nameAfil: unirNombres(res.PRIMER_NOMBRE, res.SEGUNDO_NOMBRE, res.TERCER_NOMBRE, res.PRIMER_APELLIDO, res.SEGUNDO_APELLIDO)
            };

            this.getFilas().then(() => this.cargar());
            this.cargar();
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

      const beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(this.tipoPersonaSelected).toPromise();

      // Mapea los beneficios para generar una lista
      let temp = beneficios.map((item: any) => {
        return {
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max
        };
      });

      // Actualiza las configuraciones de los campos del formulario (myFormFields1)
      this.myFormFields1 = [
        {
          type: 'dropdown', label: 'Tipo persona', name: 'tipo_persona',
          options: this.tiposPersona,
          validations: [Validators.required], display: true
        },
        {
          type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
          options: [],
          validations: [Validators.required], display: true
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
        { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.min(0)], display: true, },
        { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required, Validators.min(0)], display: true, },
        { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.required, Validators.min(0)], display: true, },
        { type: 'number', label: 'Monto útima cuota', name: 'monto_ultima_cuota', validations: [Validators.required, Validators.required, Validators.min(0)], display: true },
        {
          type: 'date',
          label: 'Fecha de efectividad',
          name: 'fecha_calculo',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },
        { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1)], display: false },
        {
          type: 'number', label: 'último día de última renta', name: 'ultimo_dia_ultima_renta', validations: [
            Validators.min(1),
            Validators.max(31),
          ], display: false
        },
      ];


      // Oculta ciertos campos adicionales si es necesario
      this.myFormFields1[this.myFormFields1.length - 1].display = false;
      this.myFormFields1[this.myFormFields1.length - 2].display = false;

      // Muestra el formulario después de configurar los campos
      this.mostrarDB = true;

      // Retorna la lista de beneficios mapeados
      return temp;

    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      return null;  // En caso de error, retornar null o manejar el error como sea necesario
    }
  };
  getTipoBenBeneficiarios = async (tipoPers: any) => {
    try {

      const beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(tipoPers).toPromise();
      // Mapea los beneficios para generar una lista
      let temp = beneficios.map((item: any) => {
        return {
          label: item.beneficio.nombre_beneficio,
          value: item.beneficio.nombre_beneficio,
          periodicidad: item.beneficio.periodicidad,
          numero_rentas_max: item.beneficio.numero_rentas_max,
          regimen: item.beneficio.regimen.ley
        };
      });

      // Actualiza las configuraciones de los campos del formulario (myFormFields2)
      this.myFormFields2 = [
        { type: 'text', label: 'DNI del beneficiario', name: 'dni', value: "", validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, readOnly: true },
        {
          type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
          options: temp,
          validations: [Validators.required], display: true
        },
        {
          type: 'text', label: 'regimen', name: 'regimen',
          readOnly: true,
          value: "",
          validations: [], display: true,
        },
        {
          type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
          options: [{ label: 'APROBADO', value: 'APROBADO' }, { label: 'RECHAZADO', value: 'RECHAZADO' }], validations: [Validators.required], display: true
        },
        { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.min(0)], display: true, },
        { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required,], display: true, },
        { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.required, Validators.min(0)], display: true, },
        { type: 'number', label: 'Monto ultima cuota', name: 'monto_ultima_cuota', validations: [Validators.required, Validators.min(0)], display: true },
        {
          type: 'date',
          label: 'Fecha de efectividad',
          name: 'fecha_calculo',
          max: new Date().toISOString().split('T')[0],
          validations: [Validators.required, noFutureDateValidator],
          display: true
        },
        { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },
        { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1)], display: false },
        {
          type: 'number', label: 'último día de última renta', name: 'ultimo_dia_ultima_renta', validations: [
            Validators.min(1),
            Validators.max(31),
          ], display: false
        },
      ];

      this.myFormFields2[this.myFormFields2.length - 1].display = false;
      this.myFormFields2[this.myFormFields2.length - 2].display = false;

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
    if (this.Afiliado.fallecido == "SI" && (this.Afiliado.tipo_persona == 'AFILIADO' ||
      this.Afiliado.tipo_persona == 'JUBILADO' ||
      this.Afiliado.tipo_persona == 'PENSIONADO')) {
      try {
        await this.getColumns();
        const data = await this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).toPromise();

        this.filas = data.map((item: any) => ({
          dni: item.n_identificacion,
          nombre_completo: this.unirNombres(item.primer_nombre, item.segundo_nombre, item.tercer_nombre, item.primer_apellido, item.segundo_apellido),
          genero: item.genero,
          tipo_afiliado: item.tipo_persona,
          porcentaje: item.porcentaje,
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

  getColumns = async () => {
    try {
      this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).subscribe(
        async (response) => {
          const primerObjetoTransformado = this.transformarObjeto(response[0]);
          this.myColumns = [
            { header: 'N_Identificacion', col: 'dni', },
            {
              header: 'Nombre Completo',
              col: 'nombre_completo',

            },
            { header: 'Genero', col: 'genero', },
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
    try {

      // Obtiene los beneficios basados en el tipo de afiliado seleccionado
      if (row.tipo_afiliado === "BENEFICIARIO") {
        this.toastr.error("La persona se encuentra como beneficiario.");
        this.toastr.warning(`No se puede asignar beneficios a los beneficiarios del mismo causante, solo a los designados`, "Advertencia");
      }

      const temp = await this.getTipoBenBeneficiarios(row.tipo_afiliado);
      if (!temp || temp.length === 0) {
        this.mostrarB = false;  // No mostrar el formulario de beneficios
        //this.form1.reset();     // Opcionalmente, reinicia el formulario
        //this.FormBen.reset();   // Opcionalmente, reinicia el formulario
        return;  // Detener la ejecución
      } else {
        this.desOBenSeleccionado = row;
        // Si hay beneficios, proceder con la lógica y mostrar el formulario
        this.myFormFields2[0].value = row.dni;
        this.mostrarB = true;
        // Actualizar el formulario con los beneficios obtenidos
        //this.form1.patchValue(temp);  // O cualquier lógica para manejar los beneficios
      }


    } catch (error) {
      console.error('Error al manejar la fila seleccionada:', error);
    }
  }

  async prueba(event: any): Promise<any> {
    if (event.fieldName == "tipo_persona") {
      this.tipoPersonaSelected = event.value;
      this.tiposPersona = event.value;

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
      this.myFormFields1[1].options = this.beneficios;

    } else if (event.fieldName == "nombre_beneficio") {
      this.tipoBenefSelected = event.value;

      this.temp(event, this.beneficios, this.tipoBenefSelected);
    }

  }
  async prueba1(event: any): Promise<any> {
    let ben = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona("DESIGNADO").toPromise();
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

    if (event.fieldName == "nombre_beneficio") {
      this.tipoBenefSelected = event.value;

      this.temp(event, this.beneficios, this.tipoBenefSelected);
    }

  }

  temp(data: any, beneficios: any, tipoBenefSelected?: any) {
    let startDateFormatted;
    let endDateFormatted;

    if (tipoBenefSelected) {
      for (let i of beneficios) {
        if (i.value == tipoBenefSelected) {
          if (this.myFormFields1.length > 0) {
            this.myFormFields1[2].value = i.regimen.ley;
          } else if (this.myFormFields2.length > 0) {
            this.myFormFields2[2].value = i.regimen.ley;
          }
        }
      }

      const temp = this.buscarPeriodicidad(beneficios, tipoBenefSelected)
      if (temp == "V") {
        if (this.myFormFields1.length > 0) {
          this.myFormFields1[this.myFormFields1.length - 1].display = false;
          this.myFormFields1[this.myFormFields1.length - 2].display = false;
        } else if (this.myFormFields2.length > 0) {
          this.myFormFields2[this.myFormFields2.length - 1].display = false;
          this.myFormFields2[this.myFormFields2.length - 2].display = false;
        }

        const fechaActual = new Date();

        startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
        endDateFormatted = '01-01-2500';
      } else if (!temp) {
        if (this.myFormFields1.length > 0) {
          this.myFormFields1[this.myFormFields1.length - 1].display = true;
          this.myFormFields1[this.myFormFields1.length - 2].display = true;
        } else if (this.myFormFields2.length > 0) {
          this.myFormFields2[this.myFormFields2.length - 1].display = true;
          this.myFormFields2[this.myFormFields2.length - 2].display = true;
        }

        /* const startDate = new Date(event.value.periodo.start);
        const endDate = new Date(event.value.periodo.end); */

        const opciones: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        };

        /* startDateFormatted = startDate.toLocaleDateString('es', opciones).replace(/\//g, '-');
        endDateFormatted = endDate.toLocaleDateString('es', opciones).replace(/\//g, '-'); */
      }
    }

    if (startDateFormatted != 'Invalid Date' && endDateFormatted != 'Invalid Date') {
      console.log(data);

      const datosFormateados = {
        ...data.value,
      };
      this.datosFormateados = datosFormateados;
    }
  }

  async obtenerDatos1(event: any): Promise<any> {
    this.form1 = event;
    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;

  }

  async obtenerDatosFormBen(event: any): Promise<any> {
    this.FormBen = event;
    const temp = this.buscarPeriodicidad(this.tiposBeneficios, this.FormBen.value.nombre_beneficio);

    let startDateFormatted
    let endDateFormatted

    const fechaActual = new Date();

    if (temp == "VITALICIO") {
      this.myFormFields2[8].display = false

      startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
      endDateFormatted = '01-01-2500';

    } else if (!temp) {
      this.myFormFields2[8].display = true
    }

    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;

  }

  transformarObjeto(objeto: any) {
    console.log(objeto);

    return Object.keys(objeto).map(key => {
      return {
        header: key,
        col: key,
        isEditable: false,
      };

    });
  }

  guardarNTBenef() {
    /* Asignar al afiliado si no ha fallecido */
    /* Asignar a los beneficiarios si el afiliado ya falleció */
    const fechaActual = new Date();
    if (this.Afiliado.fallecido != "SI") {
      this.datosFormateados["dni"] = this.form.value.dni;
      const startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
      let fechaFormateada = '01-01-2500';

      if (this.datosFormateados?.num_rentas_aplicadas && this.datosFormateados?.dia) {
        const endDateFormatted = addDays(addMonths(fechaActual, parseInt(this.datosFormateados?.num_rentas_aplicadas, 10)), parseInt(this.datosFormateados?.dia, 10));
        fechaFormateada = format(endDateFormatted, 'dd-MM-yyyy');
      }

      this.datosFormateados["periodo_inicio"] = startDateFormatted;
      this.datosFormateados["periodo_finalizacion"] = fechaFormateada;

      console.log(this.datosFormateados);
      console.log(this.desOBenSeleccionado);

      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.desOBenSeleccionado).subscribe(
        {
          next: (response) => {
            this.toastr.success("se asignó correctamente el beneficio");
            this.limpiarFormulario()
          },
          error: (error) => {
            console.log(error);

            let mensajeError = '';
            // Verifica si el error tiene una estructura específica
            if (error.error.mensaje) {
              mensajeError = error.error.mensaje;
            }
            this.toastr.error(mensajeError);
          }
        })
    } else {
      this.datosFormateados["dni"] = this.FormBen.value.dni;
      console.log(this.datosFormateados);
      console.log(this.desOBenSeleccionado);

      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.desOBenSeleccionado, this.Afiliado.id_persona).subscribe(
        {
          next: (response) => {
            this.toastr.success("se asignó correctamente el beneficio");
            this.limpiarFormulario()
          },
          error: (error) => {
            console.log(error);

            let mensajeError = '';
            // Verifica si el error tiene una estructura específica
            if (error.error.mensaje) {
              mensajeError = error.error.mensaje;
            }
            this.toastr.error(mensajeError);
          }
        })

    }
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    this.Afiliado = []
    if (this.form1) {
      this.form1.reset();
    }
    if (this.FormBen) {
      this.FormBen.reset();
    }
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }

}
