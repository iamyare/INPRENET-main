import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  DatosGenerales: boolean = true; DatosBacAfil: boolean = false;
  Archivos: boolean = false; DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false; referenc: boolean = false;
  datosBeneficiario: boolean = false; datosF: boolean = false;
  datosFamiliares: boolean = false; ColegiosMagisteriales: boolean = false;
  datosA = false;
  cuentas = false;

  constructor(private svcAfiliado: AfiliadoService,
              private toastr: ToastrService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, value: '' },
    ];

    this.myColumns = [
      {
        header: 'DNI',
        col: 'dni',
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
    this.DatosGenerales = true;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setEstadoDatFam(e: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = true;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setEstadoDatCentTrab(e: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = true;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosHS(datosHistSal: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = true;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosReferenc(datosHistSal: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = true;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosBenef(datosHistSal: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = true;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosF(datosHistSal: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = true;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosA(datosHistSal: any) {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = true;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosAColegiosMag(datosHistSal: any) {
    this.datosFamiliares = false;
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = true;
  }
  setDatosCuentas(datosHistSal: any) {
    this.datosFamiliares = false;
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.ColegiosMagisteriales = false;
    this.cuentas = true;
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
    if (this.form.value.dni) {
      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result;
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
        },
        (error) => {
          this.toastr.error(`Error: ${error.error.message}`);
          this.resetDatos();
        }
      );
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
}
