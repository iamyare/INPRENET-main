import { Component } from '@angular/core';
import { ConasaService } from 'src/app/services/conasa.service';

@Component({
  selector: 'app-ver-contratos',
  templateUrl: './ver-contratos.component.html',
  styleUrls: ['./ver-contratos.component.scss']
})
export class VerContratosComponent {
  persona: any = null;
  contratos: any[] = [];

  constructor(private conasaService: ConasaService) {
    
  }

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
          // Ordenar los contratos para que los "ACTIVO" estén primero
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
}
