import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dat-puesto-trab',
  templateUrl: './dat-puesto-trab.component.html',
  styleUrl: './dat-puesto-trab.component.scss'
})
export class DatPuestoTrabComponent {
  form1: FormGroup;
  datosGen:any;

  @Input() centroTrabajo?:string
  @Output() newDatPuesTChange = new EventEmitter<any>()

  onDatosPueTraChange(){
    const centroTrabajo = this.form1.value.centroTrabajo;
    const cargo = this.form1.value.cargo;
    const sectorEconomico = this.form1.value.sectorEconomico;
    const actividadEconomica = this.form1.value.actividadEconomica;
    const claseCliente = this.form1.value.claseCliente;
    const sector = this.form1.value.sector;
    const numeroAcuerdo = this.form1.value.numeroAcuerdo;
    const salarioNeto = this.form1.value.salarioNeto;
    const fechaIngreso = this.form1.value.fechaIngreso;
    const fechaPago = this.form1.value.fechaPago;
    const colegioMagisterial = this.form1.value.colegioMagisterial;
    const numeroCarnet = this.form1.value.numeroCarnet;

    const data = {
      centroTrabajo: centroTrabajo,
      cargo:cargo,
      sectorEconomico: sectorEconomico,
      actividadEconomica: actividadEconomica,
      claseCliente: claseCliente,
      sector: sector,
      numeroAcuerdo:numeroAcuerdo,
      salarioNeto: salarioNeto,
      fechaIngreso: fechaIngreso,
      fechaPago: fechaPago,
      colegioMagisterial : colegioMagisterial,
      numeroCarnet : numeroCarnet
    }

    this.newDatPuesTChange.emit(data);

  }

  constructor( private fb: FormBuilder) {
    this.form1 = this.fb.group({
     centroTrabajo: ['', [Validators.required]],
     cargo: ['', [Validators.required]],
     sectorEconomico: ['', [Validators.required]],
     actividadEconomica: ['', [Validators.required]],
     claseCliente: ['', [Validators.required]],
     sector: ['', [Validators.required]],
     numeroAcuerdo: ['', [Validators.required]],
     salarioNeto: ['', [Validators.required, Validators.pattern("\^[0-9]{1,8}([\\.][0-9]{2})")]],
     fechaIngreso: ['', [Validators.required]],
     fechaPago: ['', [Validators.required]],
     colegioMagisterial: ['', [Validators.required]],
     numeroCarnet: ['', [Validators.required]],
    });
  }

  ngOnInit():void{
  }


}
