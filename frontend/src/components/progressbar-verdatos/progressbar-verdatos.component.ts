import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-progressbar-verdatos',
  templateUrl: './progressbar-verdatos.component.html',
  styleUrl: './progressbar-verdatos.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ProgressbarVerdatosComponent {
  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() newEstCentrTrab = new EventEmitter<any>()
  @Output() newdatosHS = new EventEmitter<any>()
  @Output() newdatosRP = new EventEmitter<any>()
  @Output() newdatosB = new EventEmitter<any>()
  @Output() newdatosF = new EventEmitter<any>()
  @Output() newdatosA = new EventEmitter<any>()
  @Output() newdatosColegiosMag = new EventEmitter<any>()
  @Output() newDatosFa = new EventEmitter<any>()
  @Output() newDatosCuentas = new EventEmitter<any>()

  datosG: boolean = true;
  datosFa: boolean = false;
  datosColegMagisteriales: boolean = false;
  datosCT: boolean = false;
  datosHS: boolean = false;
  datosRP: boolean = false;
  datosB: boolean = false;
  datosA: boolean = false;
  datosF: boolean = false;
  cuentas: boolean = false;

  activarDatosGe() {
    this.datosG = true;
    this.datosFa = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newDatBenChange.emit(this.datosG);
  }

  activarDatosFam() {
    this.datosG = false;
    this.datosFa = true;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newDatosFa.emit(this.datosFa);

  }
  activarDatosCentTrab() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = true;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newEstCentrTrab.emit(this.datosCT);

  }
  activarDatosBancarios() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = true;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newdatosHS.emit(this.datosHS);
  }
  activarDatosRefPers() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = true;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newdatosRP.emit(this.datosRP);
  }
  activarDatosBenef() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = true;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newdatosB.emit(this.datosB);
  }
  activarFinalizar() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = true;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.newdatosF.emit(this.datosF);
  }

  activarDatosColMag() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = true;
    this.newdatosColegiosMag.emit(this.datosColegMagisteriales);
  }
  activarDatosCuentas() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = true;
    this.datosColegMagisteriales = false;
    this.newDatosCuentas.emit(this.cuentas);
  }

  prueba7() {
    this.datosFa = false;
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = true;
    this.datosColegMagisteriales = false;
    this.newdatosA.emit(this.datosA);
  }

}
