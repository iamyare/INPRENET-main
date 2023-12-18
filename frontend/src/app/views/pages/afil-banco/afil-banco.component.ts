import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { generatePuestoTrabFormGroup } from '@docs-components/dat-puesto-trab/dat-puesto-trab.component';
import { forkJoin } from 'rxjs';
import formatoFechaResol from 'src/app/models/fecha';
import { AfiliadoService } from 'src/app/services/afiliado.service';
@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class AfilBancoComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});

  form = this.fb.group({
    DatosGenerales: generateAddressFormGroup(),
    DatosBacAfil: generateDatBancFormGroup(),
    DatosPuestoTrab: generatePuestoTrabFormGroup(),
    benfGroup: generateAddressFormGroup(),
  });

  Bancos: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  
  public archivo: any;
  htmlSTID: string = "Archivo de identificación";

  datosGen:any; datosPuestTrab:any; datosBanc:any; datosRefPer:any;
  DatosBancBen:any = [];

  constructor( private fb: FormBuilder, private afilService: AfiliadoService) {
    this.Bancos = [
      {
        "idBanco":1,
        "value": "Atlántida"
      },
      {
        "idBanco":2,
        "value": "BAC"
      },
      {
        "idBanco":3,
        "value": "Ficohosa"
      }
    ];
    this.estadoCivil = [
      {
        "idEstadoCivil":1,
        "value": "Casado/a"
      },
      {
        "idEstadoCivil":2,
        "value": "Divorciado/a"
      },
      {
        "idEstadoCivil":3,
        "value": "Separado/a"
      },
      {
        "idEstadoCivil":4,
        "value": "Soltero/a"
      },
      {
        "idEstadoCivil":5,
        "value": "Union Libre"
      },
      {
        "idEstadoCivil":6,
        "value": "Viudo/a"
      }
    ];
    this.Sexo = [
      {
        "idBanco":1,
        "value": "M"
      },
      {
        "idBanco":2,
        "value": "F"
      }
    ];
    this.tipoIdent = [
      {
        "idIdentificacion":1,
        "value": "DNI"
      },
      {
        "idIdentificacion":2,
        "value": "PASAPORTE"
      },
      {
        "idIdentificacion":3,
        "value": "CARNET RESIDENCIA"
      },
      {
        "idIdentificacion":4,
        "value": "NÚMERO LICENCIA"
      },
      {
        "idIdentificacion":5,
        "value": "RTN"
      },
    ];
  }

  ngOnInit():void{
  }

  setDatosGen(){    
    this.form.value.DatosGenerales.tipoIdent = this.form.value.DatosGenerales.tipoIdent;
    this.form.value.DatosGenerales.archIdent = this.form.value.DatosGenerales.archIdent;
    this.form.value.DatosGenerales.numeroIden = this.form.value.DatosGenerales.numeroIden;
    this.form.value.DatosGenerales.primerNombre = this.form.value.DatosGenerales.primerNombre;
    this.form.value.DatosGenerales.segundoNombre = this.form.value.DatosGenerales.segundoNombre;
    this.form.value.DatosGenerales.tercerNombre = this.form.value.DatosGenerales.tercerNombre;
    this.form.value.DatosGenerales.primerApellido = this.form.value.DatosGenerales.primerApellido;
    this.form.value.DatosGenerales.segundoApellido = this.form.value.DatosGenerales.segundoApellido;
    this.form.value.DatosGenerales.fechaNacimiento = formatoFechaResol(this.form.value.DatosGenerales.fechaNacimiento);
    this.form.value.DatosGenerales.cantidadDependientes = this.form.value.DatosGenerales.cantidadDependientes;
    this.form.value.DatosGenerales.cantidadHijos = this.form.value.DatosGenerales.cantidadHijos;
    this.form.value.DatosGenerales.Sexo = this.form.value.DatosGenerales.Sexo;
    this.form.value.DatosGenerales.profesion = this.form.value.DatosGenerales.profesion;
    this.form.value.DatosGenerales.estadoCivil = this.form.value.DatosGenerales.estadoCivil;
    this.form.value.DatosGenerales.representacion = this.form.value.DatosGenerales.representacion;
    this.form.value.DatosGenerales.estado = this.form.value.DatosGenerales.estado;
    this.form.value.DatosGenerales.cotizante = this.form.value.DatosGenerales.cotizante;
    this.form.value.DatosGenerales.telefono1 = this.form.value.DatosGenerales.telefono1;
    this.form.value.DatosGenerales.telefono2 = this.form.value.DatosGenerales.telefono2;
    this.form.value.DatosGenerales.correo1 = this.form.value.DatosGenerales.correo1;
    this.form.value.DatosGenerales.correo2 = this.form.value.DatosGenerales.correo2;
    this.form.value.DatosGenerales.ciudadNacimiento = this.form.value.DatosGenerales.ciudadNacimiento;
    this.form.value.DatosGenerales.ciudadDomicilio = this.form.value.DatosGenerales.ciudadDomicilio;
    this.form.value.DatosGenerales.direccionDetallada = this.form.value.DatosGenerales.direccionDetallada;
  }

  setDatosPuetTrab(){    
    this.form.value.DatosPuestoTrab.centroTrabajo = this.form.value.DatosPuestoTrab.centroTrabajo;
    this.form.value.DatosPuestoTrab.cargo = this.form.value.DatosPuestoTrab.cargo;
    this.form.value.DatosPuestoTrab.sectorEconomico = this.form.value.DatosPuestoTrab.sectorEconomico;
    this.form.value.DatosPuestoTrab.actividadEconomica = this.form.value.DatosPuestoTrab.actividadEconomica;
    this.form.value.DatosPuestoTrab.claseCliente = this.form.value.DatosPuestoTrab.claseCliente;
    this.form.value.DatosPuestoTrab.sector = this.form.value.DatosPuestoTrab.sector;
    this.form.value.DatosPuestoTrab.numeroAcuerdo = this.form.value.DatosPuestoTrab.numeroAcuerdo;
    this.form.value.DatosPuestoTrab.salarioNeto = this.form.value.DatosPuestoTrab.salarioNeto;
    this.form.value.DatosPuestoTrab.fechaIngreso = formatoFechaResol(this.form.value.DatosPuestoTrab.fechaIngreso);
    this.form.value.DatosPuestoTrab.fechaPago = this.form.value.DatosPuestoTrab.fechaPago;
    this.form.value.DatosPuestoTrab.colegioMagisterial = this.form.value.DatosPuestoTrab.colegioMagisterial;
    this.form.value.DatosPuestoTrab.numeroCarnet = this.form.value.DatosPuestoTrab.numeroCarnet;
  }

  setDatosBanc(datosBanc:any){
    this.datosBanc = datosBanc;
  }

  setDatosRefPer(datosRefPer:any){
    this.datosRefPer = datosRefPer;
  }

  setDatosBen(DatosBancBen:any){
    this.DatosBancBen = DatosBancBen;
  }
  
  enviar(){
      console.log(this.form.value.DatosGenerales)
      console.log(this.form.value.DatosPuestoTrab)
      console.log(this.form.value.DatosBacAfil)
      console.log(this.datosRefPer)
      console.log(this.DatosBancBen)
    
    if (this.form.value.DatosGenerales){
      console.log(this.form.value.DatosGenerales.fechaNacimiento = formatoFechaResol(this.form.value.DatosGenerales.fechaNacimiento));

    }if (this.form.value.DatosPuestoTrab){
      this.form.value.DatosPuestoTrab.fechaIngreso = formatoFechaResol(this.form.value.DatosPuestoTrab.fechaIngreso);
      console.log(this.form.value.DatosPuestoTrab.fechaPago = formatoFechaResol(this.form.value.DatosPuestoTrab.fechaPago));

    }if(this.DatosBancBen.length>=1){
      for (let i=0 ; i<this.DatosBancBen.length; i++){
        console.log(this.DatosBancBen[i].benfGroup.fechaNacimiento = formatoFechaResol(this.DatosBancBen[0].benfGroup.fechaNacimiento));
      }
    }
    
    const data = {
      datosGen: this.form.value.DatosGenerales,
      datosPuestTrab: this.form.value.DatosPuestoTrab,
      datosBanc: this.form.value.DatosBacAfil,
      datosRefPers: this.datosRefPer,
      datosBenefic: this.DatosBancBen,
    }

    const llamada1 = this.afilService.agregarAfiliados(data);

    forkJoin([llamada1]).subscribe(
      ([datosServicio1]) => {
        console.log('Datos del Servicio 1:', datosServicio1);
      },
      (error) => {
        console.error(error);
      }
    );
  }
}