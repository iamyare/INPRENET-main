import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';// Asegúrate de tener la ruta correcta

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'INPRENET';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Este método se llama después de que el componente se inicializa.
    // No es necesario agregar contenido adicional aquí porque el constructor de AuthService
    // ya inicializa el monitoreo de inactividad.
    this.authService.startIdleWatch(); // Asegate de que el monitoreo se inicie
  }
}
