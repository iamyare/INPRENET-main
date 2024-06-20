import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrl: './progressbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ProgressbarComponent {
  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() newEstCentrTrab = new EventEmitter<any>()
  @Output() newdatosHS = new EventEmitter<any>()
  @Output() newdatosRP = new EventEmitter<any>()
  @Output() newdatosB = new EventEmitter<any>()
  @Output() newdatosF = new EventEmitter<any>()
  @Output() newdatosA = new EventEmitter<any>()
  @Output() newdatosColegiosMag = new EventEmitter<any>()
  @Output() newDatosFa = new EventEmitter<any>()

  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  datosG = false;
  datosColegMagisteriales = false;
  datosHS = false;
  datosCT = false;
  datosRP = false;
  datosB = false;
  datosF = false;

  constructor(private _formBuilder: FormBuilder) {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  activarDatosGe() {
    this.datosG = true;
    this.datosColegMagisteriales = this.datosHS = this.datosCT = this.datosRP = this.datosB = this.datosF = false;
  }

  activarDatosColMag() {
    this.datosColegMagisteriales = true;
    this.datosG = this.datosHS = this.datosCT = this.datosRP = this.datosB = this.datosF = false;
  }

  activarDatosBancarios() {
    this.datosHS = true;
    this.datosG = this.datosColegMagisteriales = this.datosCT = this.datosRP = this.datosB = this.datosF = false;
  }

  activarDatosCentTrab() {
    this.datosCT = true;
    this.datosG = this.datosColegMagisteriales = this.datosHS = this.datosRP = this.datosB = this.datosF = false;
  }

  activarDatosRefPers() {
    this.datosRP = true;
    this.datosG = this.datosColegMagisteriales = this.datosHS = this.datosCT = this.datosB = this.datosF = false;
  }

  activarDatosBenef() {
    this.datosB = true;
    this.datosG = this.datosColegMagisteriales = this.datosHS = this.datosCT = this.datosRP = this.datosF = false;
  }

  activarFinalizar() {
    this.datosF = true;
    this.datosG = this.datosColegMagisteriales = this.datosHS = this.datosCT = this.datosRP = this.datosB = false;
  }
}