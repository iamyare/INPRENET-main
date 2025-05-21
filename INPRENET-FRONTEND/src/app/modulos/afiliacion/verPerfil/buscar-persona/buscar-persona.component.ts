import { Component, ViewChild } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonaService } from 'src/app/services/persona.service';
import { MatPaginator } from '@angular/material/paginator';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss']
})
export class BuscarPersonaComponent {
  n_identificacion: string = '';
  terminosBusqueda: string = '';
  errorMessage: string | null = null;
  personas: any[] = [];
  personasPaginadas: any[] = [];
  personaSeleccionada: any = null;

  pageSize: number = 10;
  currentPage: number = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private personaService: PersonaService,private afiliacionService: AfiliacionService) {}

  buscarPersona(): void {
    this.errorMessage = null;

    if (this.n_identificacion.trim() && this.terminosBusqueda.trim()) {
      this.errorMessage = 'Por favor, llena solo uno de los campos: Número de Identificación o Nombre.';
      return;
    }

    if (this.n_identificacion.trim()) {
      this.buscarPorIdentificacion(this.n_identificacion);
    } else if (this.terminosBusqueda.trim()) {
      this.buscarPorNombresYApellidos(this.terminosBusqueda);
    } else {
      this.errorMessage = 'Debe proporcionar un número de identificación o un término de búsqueda.';
    }
  }

  buscarPorIdentificacion(dni: string): void {
    this.personaService.getPersonaByDni(dni).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada.';
        return of(null);
      })
    ).subscribe(persona => {
      if (persona) {
        this.personaSeleccionada = persona;
        this.personas = [];
        this.personasPaginadas = [];
        if (this.paginator) this.paginator.firstPage();
        this.errorMessage = null;
        this.personaService.changePersona(persona);
      }
    });
  }

  buscarPorNombresYApellidos(terminos: string): void {
    this.afiliacionService.buscarPersonaPorNombresYApellidos(terminos).pipe(
      catchError(error => {
        this.errorMessage = 'No se encontraron personas con el término proporcionado.';
        return of([]);
      })
    ).subscribe(response => {
      if (response?.personas) {
        this.personas = response.personas;
        this.currentPage = 0;
        if (this.paginator) this.paginator.firstPage();
        this.actualizarPaginacion();
        this.errorMessage = null;
      }
    });
  }

  actualizarPaginacion(): void {
    if (this.personas.length > 0) {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      this.personasPaginadas = this.personas.slice(start, end);
    } else {
      this.personasPaginadas = [];
    }
  }

  cambiarPagina(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarPaginacion();
  }

  seleccionarPersona(persona: any): void {
    this.n_identificacion = persona.dni;
    this.buscarPorIdentificacion(persona.dni);
  }

  resetBusqueda(): void {
    this.personaSeleccionada = null;
    this.n_identificacion = '';
    this.terminosBusqueda = '';
    this.personas = [];
    this.personasPaginadas = [];
    this.errorMessage = null;
  }
}
