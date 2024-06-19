import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';
import { DatePipe } from '@angular/common';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  providers: [DatePipe]
})
export class PerfilComponent implements OnInit {
  persona: any;
  @Output() resetBusqueda = new EventEmitter<void>();
  detallePersonaUnico: any[] = [];

  constructor(private personaService: PersonaService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.personaService.currentPersona.subscribe(persona => {
      this.persona = persona;
      if (persona && persona.detallePersona) {
        this.detallePersonaUnico = this.filtrarDetallePersona(persona.detallePersona);
      }
    });
  }

  filtrarDetallePersona(detallePersona: any[]): any[] {
    const tiposUnicos = new Set();
    return detallePersona.filter(detalle => {
      if (!tiposUnicos.has(detalle.tipoPersona.tipo_persona)) {
        tiposUnicos.add(detalle.tipoPersona.tipo_persona);
        return true;
      }
      return false;
    });
  }

  trackByPerfil(index: number, perfil: any): any {
    return perfil.tipoPersona.tipo_persona;
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

  formatDate(fecha: string): string {
    return this.datePipe.transform(fecha, 'dd MMMM yyyy') || '';
  }

  resetBusqueda2() {
    this.resetBusqueda.emit();
  }
}
