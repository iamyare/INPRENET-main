import { Component, Output, EventEmitter } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-perfil-header',
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.scss']
})
export class PerfilHeaderComponent {
  n_identificacion: string = '';
  errorMessage: string | null = null;
  persona: any = null;
  defaultFotoUrl = '../../../../../assets/images/AvatarDefecto.png';

  @Output() personaEncontrada = new EventEmitter<any>();

  constructor(private afiliadoService: AfiliadoService) { }

  buscarPersona(): void {
    this.afiliadoService.getAfilByParam(this.n_identificacion).pipe(
      catchError(error => {
        this.errorMessage = 'Persona no encontrada o ocurrió un error.';
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.persona = response;
        this.errorMessage = null;
        this.personaEncontrada.emit(this.persona);
      }
    });
  }

  resetBusqueda(): void {
    this.persona = null;
    this.n_identificacion = '';
    this.errorMessage = null;
    this.personaEncontrada.emit(null);
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
