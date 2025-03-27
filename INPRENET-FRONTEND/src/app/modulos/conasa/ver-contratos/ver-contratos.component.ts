import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConasaService } from 'src/app/services/conasa.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ver-contratos',
  templateUrl: './ver-contratos.component.html',
  styleUrls: ['./ver-contratos.component.scss']
})
export class VerContratosComponent {
  persona: any = null;
  contratos: any[] = [];
  contratoSeleccionado: any = null;
  motivoCancelacion: string = '';

  constructor(private conasaService: ConasaService, private toastr: ToastrService, public dialog: MatDialog) {}

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
          this.contratos = data.sort((a: any, b: any) => 
            a.status === 'ACTIVO' ? -1 : b.status === 'ACTIVO' ? 1 : 0
          );
          console.log('Contratos y Beneficiarios:', this.contratos);
        },
        error: (err) => {
          console.error('Error al obtener contratos:', err);
          this.contratos = [];
        }
      });
    }
  }

  abrirModalCancelar(contrato: any): void {
    this.contratoSeleccionado = contrato;
  }

  cerrarModal(): void {
    this.contratoSeleccionado = null;
    this.motivoCancelacion = '';
  }

  cancelarContrato(): void {
    if (!this.motivoCancelacion) {
      this.toastr.warning('Debe ingresar un motivo de cancelación.', 'Advertencia');
      return;
    }

    this.conasaService.cancelarContrato({
      id_contrato: this.contratoSeleccionado.idContrato,
      motivo_cancelacion: this.motivoCancelacion
    }).subscribe({
      next: (response) => {
        this.toastr.success('Contrato cancelado exitosamente.', 'Éxito');
        const index = this.contratos.findIndex(c => c.idContrato === this.contratoSeleccionado.idContrato);
        if (index !== -1) {
          this.contratos[index].status = 'CANCELADO';
        }
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al cancelar contrato:', err);
        this.toastr.error('Error al cancelar el contrato.', 'Error');
      }
    });
  }

  formatearDato(dato: any): string {
    return dato ? dato : 'S/D';
  }
}
