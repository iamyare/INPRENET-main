import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-gestion-banco',
  templateUrl: './gestion-banco.component.html',
  styleUrls: ['./gestion-banco.component.scss']
})
export class GestionBancoComponent {
  public dniAfiliado: string = '';
  public afiliado: any = null;
  public errorMessage: string | null = null;

  constructor( private personaService: PersonaService) { }

  buscarAfiliado() {
    this.personaService.getPersonaByDni(this.dniAfiliado).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada.';
        return of(null);
      })
    ).subscribe(persona => {
      if (persona) {
        this.afiliado = persona.persona;
        this.personaService.changePersona(persona.persona);
        this.errorMessage = null;
      }
    });
  }

  resetBusqueda() {
    this.afiliado = null;
    this.dniAfiliado = '';
    this.errorMessage = null;
  }
}
