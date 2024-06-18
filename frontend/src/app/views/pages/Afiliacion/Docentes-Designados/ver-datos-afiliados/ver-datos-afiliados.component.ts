import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';


@Component({
  selector: 'app-ver-datos-afiliados',
  templateUrl: './ver-datos-afiliados.component.html',
  styleUrls: ['./ver-datos-afiliados.component.scss']
})
export class VerDatosAfiliadosComponent implements OnInit {
  DatosGenerales: boolean = true;
  DatosBacAfil: boolean = false;
  Archivos: boolean = false;
  DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false;
  referenc: boolean = false;
  datosBeneficiario: boolean = false;
  datosF: boolean = false;
  ColegiosMagisteriales: boolean = false;
  datosA = false;
  cuentas = false;
  loading = false;
  generacionConstancias: boolean = false; // Nueva propiedad

  constructor(private svcAfiliado: AfiliadoService,
    private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'Número de identificación del afiliado', name: 'n_identificacion', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, value: '' },
    ];

    this.myColumns = [
      {
        header: 'N_IDENTIFICACION',
        col: 'n_identificacion',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true
      },
      {
        header: 'Genero',
        col: 'genero',
        isEditable: true
      },
      {
        header: 'Fecha de Nacimiento',
        col: 'fecha_nacimiento',
        isEditable: true
      }
    ];
  }

  // Manejan el control del progreso de los datos
  setEstadoDatGen(e: any) {
    this.resetEstados();
    this.DatosGenerales = true;
  }

  setEstadoDatCentTrab(e: any) {
    this.resetEstados();
    this.DatosPuestoTrab = true;
  }

  setDatosHS(datosHistSal: any) {
    this.resetEstados();
    this.DatosHS = true;
  }

  setDatosReferenc(datosHistSal: any) {
    this.resetEstados();
    this.referenc = true;
  }

  setDatosBenef(datosHistSal: any) {
    this.resetEstados();
    this.datosBeneficiario = true;
  }

  setDatosF(datosHistSal: any) {
    this.resetEstados();
    this.datosF = true;
  }

  setDatosA(datosHistSal: any) {
    this.resetEstados();
    this.datosA = true;
  }

  setDatosAColegiosMag(datosHistSal: any) {
    this.resetEstados();
    this.ColegiosMagisteriales = true;
  }

  setDatosCuentas(datosHistSal: any) {
    this.resetEstados();
    this.cuentas = true;
  }

  setGeneracionConstancias(event: any) {
    this.resetEstados();
    this.generacionConstancias = true;
  }

  resetEstados() {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
    this.generacionConstancias = false;
  }

  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];

  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  ejecF: any;

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    this.fakeLoading();
    if (this.form.value.n_identificacion) {
      this.svcAfiliado.getAfilByParam(this.form.value.n_identificacion).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result;
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
        },
        (error) => {
          this.toastr.error(`Error: ${error.error.message}`);
          /* this.resetDatos(); */
        }
      );
    } else {
      console.log('El campo DNI es nulo o indefinido');
    }
  }


  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.Afiliado = undefined;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  fakeLoading() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }
}
