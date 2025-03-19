import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { PersonaService } from 'src/app/services/persona.service';
import { DatePipe } from '@angular/common';
import { convertirFechaInputs, convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { AfiliacionService } from '../../../../services/afiliacion.service';

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
  datosCompletos: boolean = true;
  tieneBancoActivo: boolean = true;
  ultimaActualizacionValida: boolean = true;
  beneficiariosValidos: boolean = true;
  tieneCentroTrabajo: boolean = true;
  tieneReferencias: boolean = true;

  // Variable para el mensaje cuando supera 2 años sin actualizar
  mensajeSinActualizacion: string = '';

  constructor(private personaService: PersonaService,
      private datePipe: DatePipe,
      private afiliacionService: AfiliacionService,
      private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.personaService.currentPersona.subscribe(persona => {
      if (!persona) return;

      this.persona = persona;
      this.detallePersonaUnico = this.filtrarDetallePersona(persona.detallePersona || []);

      this.verificarTiempoSinActualizacion(this.persona.ultima_fecha_actualizacion || null);
      this.verificarValidaciones();
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

  onDatoAgregado(): void {
    this.verificarValidaciones();
    this.cdr.detectChanges();
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

  private verificarTiempoSinActualizacion(fechaUltima: string | null): void {
    if (!fechaUltima) {
      this.ultimaActualizacionValida = false;
      return;
    }

    const hoy = new Date();
    const ultima = new Date(fechaUltima);
    const diffYears = (hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    this.ultimaActualizacionValida = diffYears <= 2;
    this.mensajeSinActualizacion = diffYears > 2
      ? `Tiene ${Math.floor(diffYears)} año(s) y ${Math.floor((diffYears - Math.floor(diffYears)) * 12)} mes(es) sin actualizar.`
      : '';
  }

  private verificarValidaciones(): void {
    if (!this.persona?.id_persona) return;

    this.afiliacionService.tieneBancoActivo(this.persona.id_persona).subscribe(
      (response) => {
        this.datosCompletos = response.datosCompletos;
        this.tieneBancoActivo = response.tieneBancoActivo;
        this.beneficiariosValidos = response.beneficiariosValidos;
        this.tieneCentroTrabajo = response.tieneCentroTrabajo;
        this.tieneReferencias = response.tieneReferencias;
        this.ultimaActualizacionValida = response.ultimaActualizacionValida;

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error obteniendo validaciones:', error);
      }
    );
  }

  
}
