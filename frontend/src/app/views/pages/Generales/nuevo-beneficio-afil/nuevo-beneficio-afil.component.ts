import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { format } from 'date-fns';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { log } from 'console';
@Component({
  selector: 'app-nuevo-beneficio-afil',
  templateUrl: './nuevo-beneficio-afil.component.html',
  styleUrl: './nuevo-beneficio-afil.component.scss'
})
export class NuevoBeneficioAfilComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form: any;
  form1: any
  FormBen: any
  datosFormateados: any;
  unirNombres: any = unirNombres;
  tiposBeneficios: any = [];


  public myFormFields: FieldConfig[] = []
  public myFormFields1: FieldConfig[] = []
  public myFormFields2: FieldConfig[] = []

  Afiliado: any = {}

  myColumns: any = []
  datosTabl: any[] = [];
  filas: any
  ejecF: any;


  /* myColumnsBeneficios:  any[] = [];
  datosTablBeneficios:  any[] = [];
  filasBeneficios:any;
  ejecFBeneficios: any; */

  constructor(
    private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService, private fb: FormBuilder,
    private toastr: ToastrService, private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getTipoBen();

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    /* SI SE MUEVE LA FILA Periodo hay que cambiar la posicion en la funcion obtenerDatos1 */
    this.myFormFields1 = [
      {
        type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
        options: this.tiposBeneficios,
        validations: [Validators.required], display: true
      },
      {
        type: 'dropdown', label: 'Metodo de pago', name: 'metodo_pago',
        options: [{ label: 'Cheque', value: 'Cheque' }, { label: 'Transferencia', value: 'Transferencia' }], validations: [Validators.required], display: true
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required], display: true },
      { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required], display: true },
      { type: 'daterange', label: 'Periodo', name: 'periodo', validations: [], display: false },
      { type: 'text', label: 'Ley Aplicable', name: 'ley_aplicable', validations: [], display: true },
    ];

    this.myFormFields2 = [
      { type: 'text', label: 'DNI del beneficiario', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
      {
        type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
        options: this.tiposBeneficios,
        validations: [Validators.required], display: true
      },
      {
        type: 'dropdown', label: 'Metodo de pago', name: 'metodo_pago',
        options: [{ label: 'Cheque', value: 'Cheque' }, { label: 'Transferencia', value: 'Transferencia' }], validations: [Validators.required], display: true
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required], display: true },
      { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required], display: true },
      { type: 'daterange', label: 'Periodo', name: 'periodo', validations: [], display: false },
    ];


    this.myFormFields1[4].display = false;
    this.myFormFields2[5].display = false;

    /*  this.myColumnsBeneficios = [
       {
         header: 'Nombre del beneficio',
         col: "nombre_beneficio",
         isEditable: true,
         validationRules: [Validators.required, Validators.minLength(3)]
       },
       {
         header: 'Monto total beneficio',
         col: "monto_total",
         isEditable: true,
         validationRules: [Validators.required, Validators.minLength(3)]
       },
       {
         header: 'Número de rentas aplicadas',
         col: "num_rentas_aplicadas",
         isEditable: true,
         validationRules: [Validators.required, Validators.minLength(3)]
       },
       {
         header: 'Número de rentas máximas',
         col: "numero_rentas_max",
         isEditable: true,
         validationRules: [Validators.required, Validators.minLength(3)]
       }
     ] */
  }

  getTipoBen = async () => {
    try {
      const beneficios = await this.svcBeneficioServ.getTipoBeneficio().toPromise();
      const tiposBen = beneficios.map((item: any) => {
        this.tiposBeneficios.push({
          label: `${item.nombre_beneficio}`,
          value: `${item.nombre_beneficio}`,
          periodicidad: `${item.periodicidad}`
        }
        )
        return {
          id: item.id_beneficio,
          nombre_beneficio: item.nombre_beneficio,
          descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
          estado: item.estado,
          prioridad: item.prioridad,
          monto_beneficio: item.monto_beneficio,
          porcentaje_beneficio: item.porcentaje_beneficio,
          anio_duracion: item.anio_duracion,
          mes_duracion: item.mes_duracion,
          dia_duracion: item.dia_duracion,
          ley_aplicable: item.ley_aplicable,
        };
      });
      return tiposBen;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
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
        if (arreglo[i].periodicidad == "VITALICIO") {
          // Si coincide, retornar la periodicidad
          return arreglo[i].periodicidad;
        }
      }
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  /*   ejecutarFuncionAsincronaDesdeOtroComponentes(funcion: (data:any) => Promise<void>) {
      this.ejecFBeneficios = funcion;
    } */

  getFilas = async () => {
    if (this.Afiliado.ESTADO == "FALLECIDO") {
      try {
        await this.getColumns();
        const data = await this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).toPromise();

        this.filas = data.map((item: any) => ({
          dni: item.dni,
          nombre_completo: this.unirNombres(item.primer_nombre, item.segundo_nombre, item.tercer_nombre, item.primer_apellido, item.segundo_apellido),
          genero: item.genero,
          tipo_afiliado: item.tipo_afiliado,
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

        return data;
      } catch (error) {
        console.error("Error al obtener datos de beneficios", error);
        throw error;
      }
    }
  };

  /* getBeneficios = async () => {
    if (this.Afiliado.estado == "FALLECIDO"){
      try {
        const data = await this.svcAfilServ.obtenerBeneficiosDeAfil(this.form.value.dni).toPromise();
        this.filasBeneficios = data.map((item: any) => ({
          id_beneficio: item.id_beneficio,
          nombre_beneficio: item.nombre_beneficio,
          num_rentas_aplicadas: item.num_rentas_aplicadas,
          numero_rentas_max: item.numero_rentas_max
        }));
        console.log(data);

        return data;
      } catch (error) {
        console.error("Error al obtener datos de beneficios", error);
        throw error;
      }
    }
  }; */

  getColumns = async () => {
    try {

      this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).subscribe(
        async (response) => {
          console.log(response);

          const primerObjetoTransformado = this.transformarObjeto(response[0]);
          this.myColumns = [
            { header: 'DNI', col: 'dni', isEditable: false },
            {
              header: 'Nombre Completo',
              col: 'nombre_completo',
              isEditable: false
            },
            { header: 'Genero', col: 'genero', isEditable: false },
            {
              header: 'Tipo Afiliado',
              col: 'tipo_afiliado',
              isEditable: false
            },
            { header: 'Porcentaje', col: 'porcentaje', isEditable: false },
          ];
        },
        (error) => {
        })

    } catch (error) {
      console.log(error);
    }
  }

  cargar() {
    if (this.ejecF /* && this.ejecFBeneficios */) {
      this.ejecF(this.filas).then(() => {
      });
      /* this.ejecFBeneficios(this.filasBeneficios).then(() => {
      }); */
    }
  }

  async obtenerDatos1(event: any): Promise<any> {
    this.form1 = event;

    const temp = this.buscarPeriodicidad(this.tiposBeneficios, this.form1.value.nombre_beneficio)

    let startDateFormatted
    let endDateFormatted

    if (temp == "VITALICIO") {
      this.myFormFields1[4].display = false

      const fechaActual = new Date();

      startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
      endDateFormatted = '01-01-2500';

    } else if (!temp) {
      this.myFormFields1[4].display = true

      const startDate = new Date(event.value.periodo.start);
      const endDate = new Date(event.value.periodo.end);

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      startDateFormatted = startDate.toLocaleDateString('es', opciones).replace(/\//g, '-');
      endDateFormatted = endDate.toLocaleDateString('es', opciones).replace(/\//g, '-');

    }

    if (startDateFormatted != 'Invalid Date' && endDateFormatted != 'Invalid Date') {
      const datosFormateados = {
        ...event.value,
        periodoInicio: startDateFormatted,
        periodoFinalizacion: endDateFormatted
      };
      delete datosFormateados.periodo;
      this.datosFormateados = datosFormateados;
    }

  }

  async obtenerDatosFormBen(event: any): Promise<any> {
    this.FormBen = event;
    const temp = this.buscarPeriodicidad(this.tiposBeneficios, this.FormBen.value.nombre_beneficio);

    let startDateFormatted
    let endDateFormatted

    if (temp == "VITALICIO") {
      this.myFormFields2[5].display = false

      const fechaActual = new Date();

      startDateFormatted = format(fechaActual, 'dd-MM-yyyy');
      endDateFormatted = '01-01-2500';

    } else if (!temp) {
      this.myFormFields2[5].display = true

      const startDate = new Date(event.value.periodo.start);
      const endDate = new Date(event.value.periodo.end);

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      startDateFormatted = startDate.toLocaleDateString('es', opciones).replace(/\//g, '-');
      endDateFormatted = endDate.toLocaleDateString('es', opciones).replace(/\//g, '-');

    }

    if (startDateFormatted != 'Invalid Date' && endDateFormatted != 'Invalid Date') {
      const datosFormateados = {
        ...event.value,
        periodoInicio: startDateFormatted,
        periodoFinalizacion: endDateFormatted
      };
      delete datosFormateados.periodo;
      this.datosFormateados = datosFormateados;
    }
  }

  previsualizarInfoAfil() {
    this.Afiliado.nameAfil = ""
    if (this.form.value.dni) {

      this.svcAfilServ.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
          //this.getBeneficios().then(() => this.cargar());
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.Afiliado.estado = ""
          this.toastr.error(`Error: ${error.error.message}`);
        })
    }
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
    /* Asignar a los beneficioarios si el afiliado ya fallecio */
    if (this.Afiliado.ESTADO != "FALLECIDO") {
      this.datosFormateados["dni"] = this.form.value.dni;
      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados).subscribe(
        {
          next: (response) => {
            this.toastr.success("se asignó correctamente el beneficio");
            this.limpiarFormulario()

          },
          error: (error) => {
            let mensajeError = 'Error desconocido al crear Detalle de deducción';
            // Verifica si el error tiene una estructura específica
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              // Para errores que vienen como un string simple
              mensajeError = error.error;
            }
            this.toastr.error(mensajeError);
          }
        })
    } else {
      this.datosFormateados["dni"] = this.FormBen.value.dni;
      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados, this.Afiliado.id_persona).subscribe(
        {
          next: (response) => {
            this.toastr.success("se asignó correctamente el beneficio");
            this.limpiarFormulario()
          },
          error: (error) => {
            let mensajeError = 'Error desconocido al crear Detalle de deducción';
            // Verifica si el error tiene una estructura específica
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              // Para errores que vienen como un string simple
              mensajeError = error.error;
            }
            this.toastr.error(mensajeError);
          }
        })

    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      /*       this.deduccionesService.uploadDetalleDeduccion(file).subscribe({
              next: (res: any) => {
                console.log('Upload successful', res);
              },
              error: (err: any) => {
                console.error('Upload failed', err);
              }
            }); */
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

  editar = (row: any) => {
    /* const deduccionData = {
      nombre_deduccion: row.nombre_deduccion,
      descripcion_deduccion: row.descripcion_deduccion,
      tipo_deduccion: row.tipo_deduccion,
      prioridad: row.prioridad,

    }

    this.deduccionesService.updateDeduccion(row.id, deduccionData).subscribe(
      (response) => {
        this.toastr.success('Deduccion editada con éxito');
      },
      (error) => {
        this.toastr.error('Error al actualizar Deduccion');
      }
    ); */
  };
}
