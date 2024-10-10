import { Component } from '@angular/core';

@Component({
  selector: 'app-detalle-envio-escalafon',
  templateUrl: './detalle-envio-escalafon.component.html',
  styleUrls: ['./detalle-envio-escalafon.component.scss']
})
export class DetalleEnvioEscalafonComponent {

  handlePersonaEncontrada(persona: any): void {
    if (persona) {
      console.log('Persona recibida en DetalleEnvioEscalafonComponent:', persona);
      // Aquí puedes hacer lo que necesites con la persona recibida
    } else {
      console.log('Búsqueda reseteada o persona no encontrada');
    }
  }
}
