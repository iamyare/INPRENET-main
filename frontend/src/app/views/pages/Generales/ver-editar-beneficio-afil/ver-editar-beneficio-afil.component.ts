import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { convertirFecha } from '../../../../shared/functions/formatoFecha';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-ver-editar-beneficio-afil',
  templateUrl: './ver-editar-beneficio-afil.component.html',
  styleUrl: './ver-editar-beneficio-afil.component.scss'
})
export class VerEditarBeneficioAfilComponent {
  unirNombres: any = unirNombres;
  convertirFecha:any = convertirFecha;

  Afiliado:any = {}
  form:any
  public myFormFields: FieldConfig[] = []

  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] =[]
  detallesCompletos: any[] = [];
  ejecF: any;

  constructor(
    private http: HttpClient,
    private beneficioService: BeneficiosService,
    private datePipe: DatePipe,
    private toastr: ToastrService) {
    }

  personData = {
    name: "Cristian Garay",
    email: "cristiangaray@gmail.com",
    orderNumber: "C95B670AC",
    payment: {
      method: "Webpay Redcompra",
      total: 11415,
      date: "26 de Octubre de 2017 12:42"
    }
  };

  dataPrueba = {
    ingresos: [
      { nombre_ingreso: "pensión por vejez", monto: 5000 },
      { nombre_ingreso: "Beneficio por incapacidad", monto: 6000 }
    ],
    deducciones: [
      { nombre_deduccion: "préstamos", total_deduccion: 2000 },
      { nombre_deduccion: "intereses", total_deduccion: 3000 }
    ]
  };

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display:true },
    ];

    this.myColumns = [
      /* {
        header: 'DNI',
        col : 'dni',
        isEditable: false
      },
      {
        header: 'Nombre Completo',
        col : 'nombre_completo',
        isEditable: true
      },
      {
        header: 'Tipo de afiliado',
        col : 'tipo_afiliado',
        isEditable: true
      },
      {
        header: 'Porcentaje',
        col : 'porcentaje',
        isEditable: true
      },*/
      {
        header: 'Nombre del beneficio',
        col : 'nombre_beneficio',
        isEditable: false
      },
/*       {
        header: 'Estado del pago de beneficio',
        col : 'estado',
        isEditable: true
      },
      {
        header: 'Número de rentas aplicadas',
        col : 'num_rentas_aplicadas',
        isEditable: true
      },
      {
        header: 'Planilla',
        col : 'cod_planilla',
        isEditable: true
      }, */
      {
        header: 'Monto por periodo',
        col : 'monto_por_periodo',
        isEditable: true
      },
      {
        header: 'Monto total',
        col : 'monto_total',
        isEditable: true
      },
      {
        header: 'Periodicidad',
        col : 'periodicidad',
        isEditable: false
      },
      {
        header: 'Periodo de inicio',
        col : 'periodoInicio',
        isEditable: false
      },
      {
        header: 'Periodo de finalización',
        col : 'periodoFinalizacion',
        isEditable: false
      },
      {
        header: 'Número de rentas máximas',
        col : 'numero_rentas_max',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event:any):Promise<any>{
    this.form = event;
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      /* Falta traer datos de la planilla */
      const data = await this.beneficioService.GetAllBeneficios().toPromise();
      this.filasT = data.map((item: any) => ({
        fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
        dni: item.dni,
        nombre_completo: this.unirNombres(item.primer_nombre, item.segundo_nombre, item.primer_apellido, item.segundo_apellido),
        nombre_beneficio: item.nombre_beneficio,
        monto_a_pagar: item.monto_a_pagar,
        numero_rentas_max: item.numero_rentas_max,
        porcentaje: item.porcentaje,
        periodicidad: item.periodicidad,
        tipo_afiliado: item.tipo_afiliado,
        num_rentas_aplicadas: item.num_rentas_aplicadas,
        periodoInicio: convertirFecha(item.periodoInicio),
        periodoFinalizacion: convertirFecha(item.periodoFinalizacion)
      }));

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  previsualizarInfoAfil(){
    this.Afiliado.nameAfil = ""
    if (this.form.value.dni){

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

}
