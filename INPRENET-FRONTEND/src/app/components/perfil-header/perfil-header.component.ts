import { Component, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-perfil-header',
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.scss']
})
export class PerfilHeaderComponent {
  @Input() personaInput: any;
  @Input() consultaAlternativa: ((dni: string) => any) | null = null; // Función opcional
  @Output() personaEncontrada = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  n_identificacion: string = '';
  terminosBusqueda: string = '';
  errorMessage: string | null = null;
  persona: any = null;
  personas: any[] = [];
  personasPaginadas: any[] = []; // Para mostrar solo los resultados de la página actual
  defaultFotoUrl = '../../../../../assets/images/default.jpg';

  pageSize: number = 10; // Número de filas por página
  currentPage: number = 0; // Página actual

  constructor(private afiliadoService: AfiliadoService, private afiliacionService: AfiliacionService) {}

  buscarPersona(): void {
    this.errorMessage = null;

    if (this.n_identificacion.trim() && this.terminosBusqueda.trim()) {
      this.errorMessage = 'Por favor, llena solo uno de los campos: Número de Identificación o Nombre.';
      return;
    }

    if (this.n_identificacion.trim()) {
      // Buscar por número de identificación
      this.realizarBusquedaPorIdentificacion(this.n_identificacion);
    } else if (this.terminosBusqueda.trim()) {
      this.afiliacionService.buscarPersonaPorNombresYApellidos(this.terminosBusqueda).pipe(
        catchError(error => {
          this.errorMessage = 'No se encontraron personas con el término proporcionado.';
          this.personaEncontrada.emit(null); // Emitir null si no se encuentran personas
          return of([]);
        })
      ).subscribe(response => {
        if (response && response.personas) {
          this.personas = response.personas;
          this.currentPage = 0; // Reiniciar a la página 0
          if (this.paginator) {
            this.paginator.firstPage();
          }
          this.actualizarPaginacion();
          this.errorMessage = null;
        }
      });
    } else {
      this.errorMessage = 'Debe proporcionar un número de identificación o un término de búsqueda.';
    }
  }

  realizarBusquedaPorIdentificacion(dni: string): void {
    const consulta = this.consultaAlternativa || this.afiliadoService.getAfilByParam.bind(this.afiliadoService);

    consulta(dni).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada.';
        this.personaEncontrada.emit(null);
        return of(null);
      })
    ).subscribe((response:any) => {
      if (response) {
        this.persona = response;

        this.errorMessage = null;
        this.personaEncontrada.emit(this.persona);
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
    this.terminosBusqueda = ''; // Limpia el campo de búsqueda por nombre/apellidos
    this.n_identificacion = persona.dni; // Llena el campo de identificación
    this.realizarBusquedaPorIdentificacion(persona.dni); // Realiza la búsqueda directa con el DNI
    this.personas = []; // Limpia la lista de resultados
    this.personasPaginadas = []; // Limpia la tabla paginada
    this.errorMessage = null;
  }

  resetBusqueda(): void {
    this.persona = null;
    this.n_identificacion = '';
    this.terminosBusqueda = '';
    this.personas = [];
    this.personasPaginadas = [];
    this.errorMessage = null;
    this.personaEncontrada.emit(null); // Emitir null al resetear
  }

  getFotoUrl(foto: any): string {
    if (foto && foto.data) {
      return 'data:image/jpeg;base64,' + this.arrayBufferToBase64(foto.data);
    }
    return this.defaultFotoUrl;
  }

  private arrayBufferToBase64(buffer: any): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
