import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-progressplanill',
  templateUrl: './progressplanill.component.html',
  styleUrl: './progressplanill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ProgressplanillComponent {
  @Output() newDatBenChange = new EventEmitter<any>()
  @Output() newEstCentrTrab = new EventEmitter<any>()
  @Output() newdatosHS = new EventEmitter<any>()
  @Output() newdatosRP = new EventEmitter<any>()
  @Output() newdatosB = new EventEmitter<any>()
  @Output() newdatosF = new EventEmitter<any>()
  @Output() newdatosA = new EventEmitter<any>()
  datosG:boolean = true;
  datosCT:boolean = false;
  datosHS:boolean = false;
  datosRP:boolean = false;
  datosB:boolean = false;
  datosF:boolean = false;
  datosA:boolean  = false;
  @Input() estadoSubDed:boolean = false;

  prueba(){
    this.datosG  = true;
    this.datosCT  = false;
    this.datosHS  = false;
    this.datosRP  = false;
    this.datosB  = false;
    this.datosF  = false;
    this.datosA  = false;
    this.newDatBenChange.emit(this.datosG);
  }
  prueba2(){
    this.datosG  = false;
    this.datosCT  = true;
    this.datosHS  = false;
    this.datosRP  = false;
    this.datosB  = false;
    this.datosF  = false;
    this.datosA  = false;
    this.newEstCentrTrab.emit(this.datosCT);
  }
  prueba3(){
    this.datosG  = false;
    this.datosCT  = false;
    this.datosHS  = true;
    this.datosRP  = false;
    this.datosB  = false;
    this.datosF  = false;
    this.datosA  = false;
    this.newdatosHS.emit(this.datosHS);
  }
  prueba4(){
    this.datosG  = false;
    this.datosCT  = false;
    this.datosHS  = false;
    this.datosRP  = true;
    this.datosB  = false;
    this.datosF  = false;
    this.datosA  = false;
    this.newdatosRP.emit(this.datosRP);
  }
  prueba5(){
    this.datosG  = false;
    this.datosCT  = false;
    this.datosHS  = false;
    this.datosRP  = false;
    this.datosB  = true;
    this.datosF  = false;
    this.datosA  = false;
    this.newdatosB.emit(this.datosB);
  }
  prueba6(){
    this.datosG  = false;
    this.datosCT  = false;
    this.datosHS  = false;
    this.datosRP  = false;
    this.datosB  = false;
    this.datosF  = true;
    this.datosA  = false;
    this.newdatosF.emit(this.datosF);
  }
  prueba7(){
    this.datosG  = false;
    this.datosCT  = false;
    this.datosHS  = false;
    this.datosRP  = false;
    this.datosB  = false;
    this.datosF  = false;
    this.datosA  = true;
    this.newdatosA.emit(this.datosA);
  }
}
