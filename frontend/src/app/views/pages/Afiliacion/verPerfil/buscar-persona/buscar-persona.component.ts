import { Component } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss']
})
export class BuscarPersonaComponent {
  n_identifiacion: string = '';
  errorMessage: string | null = null;
  persona: any = null;

  constructor(private personaService: PersonaService) { }

  buscarPersona() {
    this.personaService.getPersonaByDni(this.n_identifiacion).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada o ocurrió un error.';
        return of(null);
      })
    ).subscribe(persona => {
      if (persona) {

        this.persona = persona;
        this.personaService.changePersona(persona);
        this.errorMessage = null;
      }
    });
  }

  resetBusqueda() {
    this.persona = null;
    this.n_identifiacion = '';
  }
}
