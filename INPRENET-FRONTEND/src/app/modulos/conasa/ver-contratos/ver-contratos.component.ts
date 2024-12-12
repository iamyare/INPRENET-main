import { Component } from '@angular/core';
import { ConasaService } from 'src/app/services/conasa.service';

@Component({
  selector: 'app-ver-contratos',
  templateUrl: './ver-contratos.component.html',
  styleUrls: ['./ver-contratos.component.scss']
})
export class VerContratosComponent {
  persona: any = null;
  contratos: any = null;

  constructor(private conasaService: ConasaService) {
    
  }

  handlePersonaEncontrada(persona: any): void {
    console.log(persona);
    if (!persona) {
      console.log(this.persona);
      this.persona = null;
      this.contratos = null;
      return;
    }

    this.persona = persona;

    const dni = persona?.N_IDENTIFICACION;
    if (dni) {
      this.conasaService.obtenerContratoYBeneficiariosPorDNI(dni).subscribe({
        next: (data) => {
          console.log(data);
          
          this.contratos = data;
          console.log('Contratos y Beneficiarios:', data);
        },
        error: (err) => {
          console.error('Error al obtener contratos:', err);
          this.contratos = null;
        }
      });
    }
  }
}
