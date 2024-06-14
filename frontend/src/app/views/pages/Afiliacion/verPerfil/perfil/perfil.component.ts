import { Component, Input, OnInit, Injector } from '@angular/core';
import { AfiliadoComponent } from '../afiliado/afiliado.component';
import { BeneficiarioComponent } from '../beneficiario/beneficiario.component';
import { JubiladoComponent } from '../jubilado/jubilado.component';
import { PensionadoComponent } from '../pensionado/pensionado.component';
import { VoluntarioComponent } from '../voluntario/voluntario.component';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  @Input() persona!: any;

  perfiles: { tipo: string, descripcion: string, componente: any, detalle: any }[] = [];

  ngOnInit() {
    this.perfiles = this.persona.detallePersona.map((detalle: any) => {
      return {
        tipo: detalle.tipoPersona.tipo_persona,
        descripcion: `Perfil de ${detalle.tipoPersona.tipo_persona}`,
        componente: this.getComponente(detalle.tipoPersona.tipo_persona),
        detalle: detalle
      };
    });
  }

  getComponente(tipoPersona: string) {
    switch(tipoPersona) {
      case 'AFILIADO': return AfiliadoComponent;
      case 'BENEFICIARIO': return BeneficiarioComponent;
      case 'JUBILADO': return JubiladoComponent;
      case 'PENSIONADO': return PensionadoComponent;
      case 'VOLUNTARIO': return VoluntarioComponent;
      default: return null;
    }
  }

  createInjector(detalle: any): Injector {
    return Injector.create({
      providers: [{ provide: 'detalle', useValue: detalle }]
    });
  }

  getFotoUrl(foto: any): string {
    if (foto && foto.data) {
      return 'data:image/jpeg;base64,' + this.arrayBufferToBase64(foto.data);
    }
    return '';
  }

  arrayBufferToBase64(buffer: any): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  convertirFechaInputs = convertirFechaInputs;
}
