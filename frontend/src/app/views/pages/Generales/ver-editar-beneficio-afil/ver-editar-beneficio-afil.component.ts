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
  public monstrarBeneficios: boolean = false;

  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] =[];
  detallesCompletos: any[] = [];
  ejecF: any;

  constructor(
    private http: HttpClient,
    private beneficioService: BeneficiosService,
    private datePipe: DatePipe,
    private toastr: ToastrService) {
    }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display:true },
    ];

    this.myColumns = [
      {
        header: 'Nombre del beneficio',
        col : 'nombre_beneficio',
        isEditable: false
      },
      {
        header: 'Periodicidad',
        col : 'periodicidad',
        isEditable: false
      },
      {
        header: 'Número de rentas máximas',
        col : 'numero_rentas_max',
        isEditable: false
      },
      {
        header: 'Periodo de inicio',
        col : 'periodoInicio',
        isEditable: true
      },
      {
        header: 'Periodo de finalización',
        col : 'periodoFinalizacion',
        isEditable: true
      },
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
    ];


  }

  async obtenerDatos(event:any):Promise<any>{
    this.form = event;
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      /* Falta traer datos de la planilla */
      const data = await this.beneficioService.GetAllBeneficios(this.form.value.dni).toPromise();
      this.filasT = data.map((item: any) => ({
        dni: item.dni,
        fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
        nombre_beneficio: item.nombre_beneficio,
        numero_rentas_max: item.numero_rentas_max,
        periodicidad: item.periodicidad,
        monto_por_periodo: item.monto_por_periodo,
        monto_total: item.monto_total,
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
    this.monstrarBeneficios = true;
    this.getFilas().then(() => this.cargar());
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

}
