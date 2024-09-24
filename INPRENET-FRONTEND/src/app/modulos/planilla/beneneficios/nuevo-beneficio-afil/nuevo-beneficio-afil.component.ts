import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { addDays, addMonths, format } from 'date-fns';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { BehaviorSubject } from 'rxjs';
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

  Afiliado: any = {}

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

  constructor(
    private cdr: ChangeDetectorRef,
    private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService, private fb: FormBuilder,
    private toastr: ToastrService, private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];
  }

  previsualizarInfoAfil() {
    this.Afiliado.nameAfil = ""

    if (this.form.value.dni) {
      this.svcAfilServ.getAfilByDni(this.form.value.dni).subscribe(
        async (res) => {
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
              fecha_nacimiento: convertirFecha(res.FECHA_NACIMIENTO, false)
            };

            const tipoPersona = item.fallecido === "SI" ? "BENEFICIARIO" : item.tipo_persona;
            this.getTipoBen(tipoPersona);

            if (this.Afiliado.tipo_persona === "AFILIADO" && this.Afiliado.estado_persona === "INACTIVO") {
              this.toastr.warning(`No se puede asignar beneficios a los Afiliados INACTIVOS`, "Advertencia");
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

  getTipoBen = async (tipoPers: string) => {
    try {
      const beneficios = await this.svcBeneficioServ.obtenerTipoBeneficioByTipoPersona(tipoPers).toPromise();

      if (beneficios && beneficios.length > 0) {
        let temp = beneficios.map((item: any) => {
          return {
            label: item.beneficio.nombre_beneficio,
            value: item.beneficio.nombre_beneficio,
            periodicidad: item.beneficio.periodicidad
          }
        });
        this.tiposBeneficios = temp;

        this.myFormFields1 = [
          {
            type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
            options: this.tiposBeneficios,
            validations: [Validators.required], display: true
          },
          {
            type: 'dropdown', label: 'Método de pago', name: 'metodo_pago',
            options: [{ label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' }], validations: [Validators.required], display: true
          },
          {
            type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
            options: [{ label: 'APROBADA', value: 'APROBADA' }, { label: 'RECHAZADA', value: 'RECHAZADA' }], validations: [Validators.required], display: true
          },
          { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'number', label: 'Monto ultima cuota', name: 'monto_ultima_cuota', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'date', label: 'Fecha de efectividad', name: 'fecha_calculo', validations: [], display: true },
          { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },
          { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1)], display: false },
          {
            type: 'number', label: 'dia', name: 'dia', validations: [
              Validators.min(1),
              Validators.max(31),
            ], display: false
          },
        ];

        this.myFormFields2 = [
          { type: 'text', label: 'DNI del beneficiario', name: 'dni', value: "", validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, readOnly: true },
          {
            type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
            options: this.tiposBeneficios,
            validations: [Validators.required], display: true
          },
          {
            type: 'dropdown', label: 'Método de pago', name: 'metodo_pago',
            options: [{ label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' }], validations: [Validators.required], display: true
          },
          {
            type: 'dropdown', label: 'Estado Solicitud', name: 'estado_solicitud',
            options: [{ label: 'APROBADA', value: 'APROBADA' }, { label: 'RECHAZADA', value: 'RECHAZADA' }], validations: [Validators.required], display: true
          },
          { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'number', label: 'Monto ultima cuota', name: 'monto_ultima_cuota', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'number', label: 'Monto primera cuota', name: 'monto_primera_cuota', validations: [Validators.required, Validators.min(0)], display: true },
          { type: 'text', label: 'Observación', name: 'observacion', validations: [], display: true },
          { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required], display: true },
          { type: 'date', label: 'Fecha de efectividad', name: 'fecha_calculo', validations: [], display: true },
          { type: 'number', label: 'Número de rentas aprobadas', name: 'num_rentas_aplicadas', validations: [Validators.min(1)], display: false },
          {
            type: 'number', label: 'dia', name: 'dia', validations: [
              Validators.min(1),
              Validators.max(31),
            ], display: false
          },
        ];

        this.myFormFields1[9].display = false;
        this.myFormFields1[10].display = false;
        this.myFormFields2[10].display = false;
        this.myFormFields2[11].display = false;

        this.mostrarDB = true;
      }
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      this.tiposBeneficiosLoaded.next(true);  // Notifica para evitar que se quede esperando
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

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  manejarRowClick(row: any) {
    // Ocultamos el formulario temporalmente
    this.mostrarB = false;

    // Asignamos el valor del DNI de la fila seleccionada al campo de DNI del beneficiario
    this.desOBenSeleccionado = row;

    this.myFormFields2[0].value = row.dni;

    // Forzamos la detección de cambios
    this.cdr.detectChanges();

    // Mostramos el formulario nuevamente
    this.mostrarB = true;

    // Forzamos una segunda detección de cambios para asegurarnos de que el valor se haya reflejado
    this.cdr.detectChanges();
  }

  async prueba(event: any): Promise<any> {
    let startDateFormatted
    let endDateFormatted

    if (event.fieldName == "nombre_beneficio") {
      const temp = this.buscarPeriodicidad(this.tiposBeneficios, event.value)

      if (temp == "V") {
        this.myFormFields1[9].display = false;
        this.myFormFields1[10].display = false;
        this.myFormFields2[10].display = false;
        this.myFormFields2[11].display = false;

        const fechaActual = new Date();

        startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
        endDateFormatted = '01-01-2500';
      } else if (!temp) {
        this.myFormFields1[9].display = true;
        this.myFormFields1[10].display = true;
        this.myFormFields2[10].display = true;
        this.myFormFields2[11].display = true;


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
      const datosFormateados = {
        ...event.value,
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
      this.myFormFields2[9].display = false

      startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
      endDateFormatted = '01-01-2500';

    } else if (!temp) {
      this.myFormFields2[9].display = true
    }

    const datosFormateados = {
      ...event.value
    };
    this.datosFormateados = datosFormateados;

  }

  transformarObjeto(objeto: any) {
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
