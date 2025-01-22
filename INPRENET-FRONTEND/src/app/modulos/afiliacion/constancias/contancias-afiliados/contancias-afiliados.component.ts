import { Component, Input, OnInit } from '@angular/core';
import { AfiliadoService } from '../../../../services/afiliado.service';
import { PersonaService } from '../../../../services/persona.service';
import { unirNombres } from '../../../../../../src/app/shared/functions/formatoNombresP';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-contancias-afiliados',
  templateUrl: './contancias-afiliados.component.html',
  styleUrls: ['./contancias-afiliados.component.scss'],
})
export class ContanciasAfiliadosComponent implements OnInit {
  @Input() persona: any = null;
  unirNombres: any = unirNombres;
  usuarioToken: {
    correo: string;
    numero_empleado: string;
    departamento: string;
    municipio: string;
    nombrePuesto: string;
    nombreEmpleado: string;
  } | null = null;

  constanciaButtons = [
    { label: 'Generar Constancia de Afiliación' },
  ];

  constructor(
    private afiliadoService: AfiliadoService,
    private personaService: PersonaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerDatosDesdeToken();
  }

  private obtenerDatosDesdeToken(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      const dataToken = this.authService.decodeToken(token);
      this.usuarioToken = {
        correo: dataToken.correo,
        numero_empleado: dataToken.numero_empleado,
        departamento: dataToken.departamento,
        municipio: dataToken.municipio,
        nombrePuesto: dataToken.nombrePuesto,
        nombreEmpleado : dataToken.nombreEmpleado
      };
    } else {
      console.warn('No se encontró un token en sessionStorage.');
    }
  }

  onPersonaEncontrada(persona: any): void {
    this.persona = persona;
  }

  onResetBusqueda(): void {
    this.persona = null;
  }

  onConstanciaClick(selectedConstanciaLabel: string): void {
    switch (selectedConstanciaLabel) {
      case 'Generar Constancia de Afiliación':
        this.generarConstanciaAfiliacion();
        break;
      default:
        console.warn('Acción no implementada para:', selectedConstanciaLabel);
    }
  }

  private obtenerPersonaActualizada(callback: (persona: any) => void): void {
    const nIdentificacion = this.persona?.N_IDENTIFICACION;
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

  private generarNombreArchivo(persona: any, tipo: string): string {
    const nombreCompleto = `${persona.primer_nombre}_${persona.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    return `${nombreCompleto}_${fechaActual}_constancia_${tipo}.pdf`;
  }

  private manejarDescarga(blob: Blob, nombreArchivo: string): void {
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(downloadURL);
  }

  generarConstanciaAfiliacion(): void {
    this.obtenerPersonaActualizada((personaActualizada) => {
      const data = this.prepararDatosConstancia(personaActualizada);
      const dto = this.usuarioToken;

      if (!dto || !dto.numero_empleado || !dto.departamento || !dto.municipio || !dto.nombrePuesto) {
        console.error('Faltan datos del usuario en el token:', dto);
        return;
      }

      this.afiliadoService.generarConstanciaQR(data, dto, 'afiliacion').subscribe(
        (blob: Blob) => {
          const nombreArchivo = this.generarNombreArchivo(personaActualizada, 'afiliacion');
          this.manejarDescarga(blob, nombreArchivo);
        },
        (error) => {
          console.error('Error al generar la constancia:', error);
        }
      );      
    });
  }

  private prepararDatosConstancia(persona: any): any {
    return {
      primer_nombre: persona.primer_nombre,
      segundo_nombre: persona.segundo_nombre,
      tercer_nombre: persona.tercer_nombre,
      primer_apellido: persona.primer_apellido,
      segundo_apellido: persona.segundo_apellido,
      n_identificacion: persona.n_identificacion,
    };
  }
}
