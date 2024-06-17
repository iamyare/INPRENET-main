// buscar-persona.component.ts
import { Component } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonaService } from '../../../../../services/persona.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss']
})
export class BuscarPersonaComponent {
  dni!: string;
  errorMessage: string | null = null;
  persona: any = null;

  constructor(private personaService: PersonaService) {}

  buscarPersona() {
    this.personaService.getPersonaByDni(this.dni).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada o ocurrió un error.';
        return of(null);
      })
    ).subscribe(persona => {
      if (persona) {
        this.persona = persona; // Asigna la persona encontrada
        this.personaService.changePersona(persona); // Actualiza el estado compartido
        this.errorMessage = null; // Reinicia el mensaje de error si se encuentra la persona
      }
    });
  }
}
