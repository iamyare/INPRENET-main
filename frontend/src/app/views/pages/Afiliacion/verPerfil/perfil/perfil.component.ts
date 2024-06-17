import { Component, Input, OnChanges, SimpleChanges, Injector, ChangeDetectionStrategy, SimpleChange, OnInit } from '@angular/core';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit{
  persona: any;
  detallePersona: any[] = [];

  constructor(private personaService: PersonaService) { }

  ngOnInit() {
    this.personaService.currentPersona.subscribe(persona => {
      this.persona = persona;
      if (persona && persona.detallePersona) {
        this.detallePersona = persona.detallePersona;
      }
    });
  }

  trackByPerfil(index: number, perfil: any): any {
    return perfil.tipo;
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
