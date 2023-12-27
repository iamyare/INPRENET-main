import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { generatePuestoTrabFormGroup } from '@docs-components/dat-puesto-trab/dat-puesto-trab.component';

import formatoFechaResol from 'src/app/models/fecha';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';

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
      Archivos: generateFormArchivo()
  });
  formReferencias:any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
  });
  formBeneficiarios:any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
  });
  formPuestTrab:any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
  });
  formHistPag:any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
  });
  
  DatosBancBen:any = [];

  constructor( private fb: FormBuilder, private afilService: AfiliadoService) {}
  ngOnInit():void{}

  setDatosGen(){    
    this.form.value.DatosGenerales.tipoIdent = this.form.value.DatosGenerales.tipoIdent;
    this.form.value.DatosGenerales.archIdent = this.form.value.DatosGenerales.archIdent;
    this.form.value.DatosGenerales.numeroIden = this.form.value.DatosGenerales.numeroIden;
    this.form.value.DatosGenerales.primerNombre = this.form.value.DatosGenerales.primerNombre;
    this.form.value.DatosGenerales.segundoNombre = this.form.value.DatosGenerales.segundoNombre;
    this.form.value.DatosGenerales.tercerNombre = this.form.value.DatosGenerales.tercerNombre;
    this.form.value.DatosGenerales.primerApellido = this.form.value.DatosGenerales.primerApellido;
    this.form.value.DatosGenerales.segundoApellido = this.form.value.DatosGenerales.segundoApellido;
    this.form.value.DatosGenerales.fechaNacimiento = this.form.value.DatosGenerales.fechaNacimiento;
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
    this.form.value.DatosPuestoTrab.fechaIngreso = this.form.value.DatosPuestoTrab.fechaIngreso;
    this.form.value.DatosPuestoTrab.fechaPago = this.form.value.DatosPuestoTrab.fechaPago;
    this.form.value.DatosPuestoTrab.colegioMagisterial = this.form.value.DatosPuestoTrab.colegioMagisterial;
    this.form.value.DatosPuestoTrab.numeroCarnet = this.form.value.DatosPuestoTrab.numeroCarnet;
  }

  setDatosPuetTrab1(datosPuestTrab:any){    
    this.formPuestTrab = datosPuestTrab 
  }

  setHistSal(datosHistSal:any){
    this.formHistPag = datosHistSal 
  }

  setDatosRefPer(datosRefPer:any){
    this.formReferencias = datosRefPer
  }
  setDatosBen(DatosBancBen:any){
    this.formBeneficiarios = DatosBancBen
  }

  enviar(){
    if (this.form.value.DatosGenerales){
      this.form.value.DatosGenerales.fechaNacimiento = formatoFechaResol(this.form.value.DatosGenerales.fechaNacimiento);  
    }if (this.form.value.DatosPuestoTrab){
      this.form.value.DatosPuestoTrab.fechaIngreso = formatoFechaResol(this.form.value.DatosPuestoTrab.fechaIngreso);
      this.form.value.DatosPuestoTrab.fechaPago = formatoFechaResol(this.form.value.DatosPuestoTrab.fechaPago);
    }if(this.DatosBancBen.length>=1){
      for (let i=0 ; i<this.DatosBancBen.length; i++){
        this.DatosBancBen[i].benfGroup.fechaNacimiento = formatoFechaResol(this.DatosBancBen[i].benfGroup.fechaNacimiento);
      }
    }

    const data = {
      datosGen: this.form.value.DatosGenerales,
      Archivos: this.form.value.Archivos,
      datosPuestTrab: this.form.value.DatosPuestoTrab,
      datosBanc: this.form.value.DatosBacAfil,
      datosRefPers: this.formReferencias.value.refpers,
      datosBenefic: this.formBeneficiarios.value.refpers
    }

    console.log(data);
    /* const llamada1 = this.afilService.agregarAfiliados(data);

    forkJoin([llamada1]).subscribe(
      ([datosServicio1]) => {
        console.log('Datos del Servicio 1:', datosServicio1);
      },
      (error) => {
        console.error(error);
      }
    ); */
  }

}