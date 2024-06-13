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
  @Output() newDatosCuentas = new EventEmitter<any>()
  @Output() newGeneracionConstancias = new EventEmitter<any>() // Nuevo evento

  datosG: boolean = true;
  datosColegMagisteriales: boolean = false;
  datosCT: boolean = false;
  datosHS: boolean = false;
  datosRP: boolean = false;
  datosB: boolean = false;
  datosF: boolean = false;
  datosA: boolean = false;
  cuentas: boolean = false;
  generacionConstancias: boolean = false; // Nueva propiedad

  activarDatosGe() {
    this.datosG = true;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newDatBenChange.emit(this.datosG);
  }

  activarDatosCentTrab() {
    this.datosG = false;
    this.datosCT = true;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newEstCentrTrab.emit(this.datosCT);
  }

  activarDatosBancarios() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = true;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newdatosHS.emit(this.datosHS);
  }

  activarDatosRefPers() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = true;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newdatosRP.emit(this.datosRP);
  }

  activarDatosBenef() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = true;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newdatosB.emit(this.datosB);
  }

  activarFinalizar() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = true;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newdatosF.emit(this.datosF);
  }

  activarDatosColMag() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = true;
    this.generacionConstancias = false;
    this.newdatosColegiosMag.emit(this.datosColegMagisteriales);
  }

  activarDatosCuentas() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = true;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newDatosCuentas.emit(this.cuentas);
  }

  activarGeneracionConstancias() { // Nuevo método
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = true;
    this.newGeneracionConstancias.emit(this.generacionConstancias);
  }

  prueba7() {
    this.datosG = false;
    this.datosCT = false;
    this.datosHS = false;
    this.datosRP = false;
    this.datosB = false;
    this.datosF = false;
    this.datosA = true;
    this.datosColegMagisteriales = false;
    this.generacionConstancias = false;
    this.newdatosA.emit(this.datosA);
  }
}
