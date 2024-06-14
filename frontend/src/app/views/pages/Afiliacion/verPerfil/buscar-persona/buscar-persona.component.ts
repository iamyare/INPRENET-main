import { Component } from '@angular/core';
import { PersonaService } from '../../../../../services/persona.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss']
})
export class BuscarPersonaComponent {
  dni: string = '';
  persona: any | null = null;
  errorMessage: string = '';

  constructor(private personaService: PersonaService) { }

  buscarPersona() {
    this.personaService.getPersonaByDni(this.dni).subscribe({
      next: (persona) => {
        this.persona = persona;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Persona no encontrada';
        this.persona = null;
      }
    });
  }
}
