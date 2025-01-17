import { Component, Input } from '@angular/core';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { PersonaService } from '../../../../services/persona.service';

@Component({
  selector: 'app-constancias-afiliado',
  templateUrl: './constancias-afiliado.component.html',
  styleUrls: ['./constancias-afiliado.component.scss']
})
export class ConstanciasAfiliadoComponent {
  @Input() persona: any;
  unirNombres: any = unirNombres;

  constructor(
    private afiliadoService: AfiliadoService,
    private personaService: PersonaService
  ) {}

  menuItems = [
    { name: 'Generar Constancia de Renuncia CAP', action: this.generarConstanciaRenunciaCap.bind(this) },
    //{ name: 'Generar Constancia datos generales', action: this.generarConstanciaAfiliacion2.bind(this) },
    { name: 'Generar Constancia de Afiliación', action: this.generarConstanciaAfiliacion.bind(this) },
    { name: 'Generar Constancia de No Cotizar', action: this.generarConstanciaNoCotizar.bind(this) },
    { name: 'Generar Constancia de Débitos', action: this.generarConstanciaDebitos.bind(this) },
    { name: 'Generar Constancia de Tiempo De Cotizar Con Monto', action: this.generarConstanciaTiempoCotizarConMonto.bind(this) }
  ];

  private obtenerPersonaActualizada(callback: (persona: any) => void): void {
    const nIdentificacion = this.persona?.n_identificacion;
    

    if (!nIdentificacion) {
      console.error('El número de identificación no está definido.');
      return;
    }
    this.personaService.getPersonaByDni(nIdentificacion).subscribe(
      (personaActualizada) => {        
        if (personaActualizada) {
          
          callback(personaActualizada);
        } else {
          console.error('Persona no encontrada.');
        }
      },
      (error) => {
        console.error('Error al obtener la persona:', error);
      }
    );
  }
  
  generarNombreArchivo(persona: any, tipo: string): string {
    const nombreCompleto = `${persona.primer_nombre}_${persona.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    return `${nombreCompleto}_${fechaActual}_constancia_${tipo}.pdf`;
  }

  generarConstanciaAfiliacion() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = {
        primer_nombre: personaActualizada.primer_nombre,
        segundo_nombre: personaActualizada.segundo_nombre,
        tercer_nombre: personaActualizada.tercer_nombre,
        primer_apellido: personaActualizada.primer_apellido,
        segundo_apellido: personaActualizada.segundo_apellido,
        n_identificacion: personaActualizada.n_identificacion,
      };

      this.afiliadoService.generarConstanciaAfiliacion(data).subscribe();
      this.afiliadoService.generarConstanciaQR(data, 'afiliacion').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'afiliacion');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }

  generarConstanciaAfiliacion2() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      this.afiliadoService.generarConstanciaAfiliacion2(personaActualizada).subscribe();
      this.afiliadoService.generarConstanciaQR(personaActualizada, 'afiliacion2').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'afiliacion2');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }
  
  generarConstanciaRenunciaCap() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = {
        primer_nombre: personaActualizada.primer_nombre,
        segundo_nombre: personaActualizada.segundo_nombre,
        tercer_nombre: personaActualizada.tercer_nombre,
        primer_apellido: personaActualizada.primer_apellido,
        segundo_apellido: personaActualizada.segundo_apellido,
        n_identificacion: personaActualizada.n_identificacion,
      };

      this.afiliadoService.generarConstanciaRenunciaCap(data).subscribe();
      this.afiliadoService.generarConstanciaQR(data, 'renuncia-cap').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'renuncia-cap');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }

  generarConstanciaNoCotizar() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = {
        primer_nombre: personaActualizada.primer_nombre,
        segundo_nombre: personaActualizada.segundo_nombre,
        tercer_nombre: personaActualizada.tercer_nombre,
        primer_apellido: personaActualizada.primer_apellido,
        segundo_apellido: personaActualizada.segundo_apellido,
        n_identificacion: personaActualizada.n_identificacion,
      };

      this.afiliadoService.generarConstanciaNoCotizar(data).subscribe();
      this.afiliadoService.generarConstanciaQR(data, 'no-cotizar').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'no-cotizar');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }

  generarConstanciaDebitos() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = {
        primer_nombre: personaActualizada.primer_nombre,
        segundo_nombre: personaActualizada.segundo_nombre,
        tercer_nombre: personaActualizada.tercer_nombre,
        primer_apellido: personaActualizada.primer_apellido,
        segundo_apellido: personaActualizada.segundo_apellido,
        n_identificacion: personaActualizada.n_identificacion,
      };
  
      this.afiliadoService.generarConstanciaDebitos(data).subscribe();
      this.afiliadoService.generarConstanciaQR(data, 'debitos').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'debitos');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }
  
  generarConstanciaTiempoCotizarConMonto() {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = {
        primer_nombre: personaActualizada.primer_nombre,
        segundo_nombre: personaActualizada.segundo_nombre,
        tercer_nombre: personaActualizada.tercer_nombre,
        primer_apellido: personaActualizada.primer_apellido,
        segundo_apellido: personaActualizada.segundo_apellido,
        n_identificacion: personaActualizada.n_identificacion,
      };
  
      this.afiliadoService.generarConstanciaTiempoCotizarConMonto(data).subscribe();
      this.afiliadoService.generarConstanciaQR(data, 'tiempo-cotizar-con-monto').subscribe((blob: Blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = this.generarNombreArchivo(personaActualizada, 'tiempo-cotizar-con-monto');
        link.click();
        window.URL.revokeObjectURL(downloadURL);
      });
    });
  }
  
}
