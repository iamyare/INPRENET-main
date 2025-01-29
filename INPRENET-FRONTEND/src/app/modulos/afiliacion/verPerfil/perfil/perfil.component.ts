import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';
import { DatePipe } from '@angular/common';
import { convertirFechaInputs, convertirFecha } from 'src/app/shared/functions/formatoFecha';

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
  defaultFotoUrl = '../../../../../assets/images/AvatarDefecto.png';

  // Variable para el mensaje cuando supera 2 años sin actualizar
  mensajeSinActualizacion: string = '';

  constructor(private personaService: PersonaService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.personaService.currentPersona.subscribe(persona => {
      this.persona = persona;

      // Si trae "detallePersona", filtramos los tipos
      if (persona && persona.detallePersona) {
        this.detallePersonaUnico = this.filtrarDetallePersona(persona.detallePersona);
      }

      // Verificamos si existe ultima_fecha_actualizacion
      if (this.persona?.ultima_fecha_actualizacion) {
        this.verificarTiempoSinActualizacion(this.persona.ultima_fecha_actualizacion);
      } else {
        // Si no hay fecha, no mostramos mensaje
        this.mensajeSinActualizacion = '';
      }
    });
  }

  filtrarDetallePersona(detallePersona: any[]): any[] {
    const tiposUnicos = new Set();
    return detallePersona.filter(detalle => {
      if (detalle.tipoPersona && !tiposUnicos.has(detalle.tipoPersona.tipo_persona)) {
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
    return this.defaultFotoUrl;
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
  convertirFecha = convertirFecha;

  formatDate(fecha: string): string {
    return this.datePipe.transform(fecha, 'dd MMMM yyyy') || '';
  }

  resetBusqueda2() {
    this.resetBusqueda.emit();
  }

  isVoluntario(): boolean {
    return this.persona?.persona?.detallePersona?.some((detalle: any) => detalle.voluntario === 'SI');
  }

  /**
   * Revisa cuántos años han pasado desde 'fechaUltima' hasta hoy.
   * Si es mayor a 2, genera el mensaje correspondiente.
   */
  private verificarTiempoSinActualizacion(fechaUltima: string): void {
    const hoy = new Date();
    const ultima = new Date(fechaUltima);
    const diffMs = hoy.getTime() - ultima.getTime(); // Diferencia en ms
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25); // Aproximado en años

    if (diffYears > 2) {
      const aniosEnteros = Math.floor(diffYears);
      const mesesAprox = Math.floor((diffYears - aniosEnteros) * 12);
      this.mensajeSinActualizacion = `Tiene ${aniosEnteros} año(s) y ${mesesAprox} mes(es) sin actualizar.`;
    } else {
      this.mensajeSinActualizacion = '';
    }
  }
}
