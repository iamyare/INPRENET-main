import { Component } from '@angular/core';

@Component({
  selector: 'app-conasa-menu',
  templateUrl: './conasa-menu.component.html',
  styleUrls: ['./conasa-menu.component.scss']
})
export class ConasaMenuComponent {
  menuOptions = [
    { label: 'Ingresar Asistencia', route: '/ingresar-asistencia', icon: 'event_available' },
    { label: 'Reporte de Asistencias Ingresadas', route: '/reporte-asistencias', icon: 'assignment' },
    { label: 'Anular Asistencias', route: '/anular-asistencias', icon: 'cancel' },
    { label: 'Modificar Asistencias', route: '/modificar-asistencias', icon: 'edit' },
    { label: 'Cancelar Asistencias', route: '/cancelar-asistencias', icon: 'close' }
  ];
}
