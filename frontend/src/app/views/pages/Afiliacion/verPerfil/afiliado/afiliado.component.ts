import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent implements OnInit {
  @Input() detalle: any = {};  // Inicializamos con un objeto vacío
  DatosGenerales: boolean = true;
  DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false;
  referenc: boolean = false;
  datosBeneficiario: boolean = false;
  datosF: boolean = false;
  ColegiosMagisteriales: boolean = false;
  datosA = false;
  cuentas = false;
  generacionConstancias: boolean = false;

  convertirFechaInputs = convertirFechaInputs;
  unirNombres: any = unirNombres;
  form: any;
  Afiliado!: any;

  constructor(private toastr: ToastrService, private svcAfiliado: AfiliadoService) {}

  ngOnInit(): void {
    this.Afiliado = this.detalle;
  }

  setEstadoDatGen() {
    this.resetEstados();
    this.DatosGenerales = true;
  }

  setEstadoDatCentTrab() {
    this.resetEstados();
    this.DatosPuestoTrab = true;
  }

  setDatosHS() {
    this.resetEstados();
    this.DatosHS = true;
  }

  setDatosReferenc() {
    this.resetEstados();
    this.referenc = true;
  }

  setDatosBenef() {
    this.resetEstados();
    this.datosBeneficiario = true;
  }

  setDatosF() {
    this.resetEstados();
    this.datosF = true;
  }

  setDatosA() {
    this.resetEstados();
    this.datosA = true;
  }

  setDatosAColegiosMag() {
    this.resetEstados();
    this.ColegiosMagisteriales = true;
  }

  setDatosCuentas() {
    this.resetEstados();
    this.cuentas = true;
  }

  setGeneracionConstancias() {
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

  resetDatos() {
    this.detalle = undefined;
  }
}
