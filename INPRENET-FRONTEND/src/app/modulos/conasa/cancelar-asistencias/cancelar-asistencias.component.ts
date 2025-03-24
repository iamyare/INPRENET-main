import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConasaService } from '../../../services/conasa.service';

@Component({
  selector: 'app-cancelar-asistencias',
  templateUrl: './cancelar-asistencias.component.html',
  styleUrls: ['./cancelar-asistencias.component.scss']
})
export class CancelarAsistenciasComponent {
  menuTitle: string = 'Cancelar Asistencias';
  persona: any = null;
  contratos: any[] = [];
  motivoCancelacion: string = '';

  constructor(
    private conasaService: ConasaService,
    private toastr: ToastrService
  ) {}

  handlePersonaEncontrada(persona: any): void {
    if (!persona) {
      this.persona = null;
      this.contratos = [];
      return;
    }

    this.persona = persona;

    const dni = persona?.N_IDENTIFICACION;
    if (dni) {
      this.conasaService.obtenerContratoYBeneficiariosPorDNI(dni).subscribe({
        next: (data) => {
          console.log('Datos recibidos:', data);

          // Filtrar contratos activos
          if (Array.isArray(data?.contratos)) {
            this.contratos = data.contratos
              .filter((contrato: any) => contrato.status !== 'CANCELADO')
              .map((contrato: any) => ({
                ...contrato,
                fechaInicioContrato: this.formatFecha(contrato.fechaInicioContrato),
                fechaCancelacionContrato: this.formatFecha(contrato.fechaCancelacionContrato),
              }));
          } else if (data) {
            const contrato = data;
            if (contrato.status !== 'CANCELADO') {
              this.contratos = [
                {
                  ...contrato,
                  fechaInicioContrato: this.formatFecha(contrato.fechaInicioContrato),
                  fechaCancelacionContrato: this.formatFecha(contrato.fechaCancelacionContrato),
                }
              ];
            } else {
              this.contratos = [];
            }
          } else {
            this.contratos = [];
          }

          // Notificar si no hay contratos activos
          if (this.contratos.length === 0) {
            this.toastr.info('No se encontraron contratos activos para este titular.', 'Información', {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            });
          }
        },
        error: (err) => {
          console.error('Error al obtener contratos:', err);
          this.toastr.error('Error al obtener contratos del titular.', 'Error', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
          this.contratos = [];
        }
      });
    }
  }

  cancelarContrato(idContrato: number): void {
    if (!this.motivoCancelacion) {
      this.toastr.warning('Por favor, ingrese un motivo de cancelación.', 'Advertencia', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      });
      return;
    }

    const payload = {
      id_contrato: idContrato,
      motivo_cancelacion: this.motivoCancelacion
    };

    this.conasaService.cancelarContrato(payload).subscribe({
      next: (response: string) => {
        this.toastr.success(response, 'Éxito', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });

        // Elimina el contrato de la lista
        this.contratos = this.contratos.filter(c => c.idContrato !== idContrato);
        this.motivoCancelacion = ''; // Limpia el motivo después de cancelar
      },
      error: (err) => {
        console.error('Error al cancelar contrato:', err);
        this.toastr.error('Error al cancelar contrato.', 'Error', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  private formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
