import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MenuSection } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userPhotoUrl: string | null = null;

  sections: MenuSection[] = [
    {
      title: 'Configuración',
      items: [
        { title: 'Perfil', icon: 'person', route: '/usuario/editar' },
        { title: 'Ajustes', icon: 'settings', route: '/ajustes' }
      ]
    },
    {
      title: 'Opciones',
      items: [
        { title: 'Cerrar Sesión', icon: 'exit_to_app', route: '/logout' }
      ]
    }
  ];

  constructor(private authService: AuthService, private sidenavService: SidenavService) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile && profile.empleadoCentroTrabajo && profile.empleadoCentroTrabajo.empleado && profile.empleadoCentroTrabajo.empleado.foto_empleado) {
          this.userPhotoUrl = `data:image/png;base64,${profile.empleadoCentroTrabajo.empleado.foto_empleado}`;
        } else {
          console.error('Perfil no encontrado o foto no disponible');
        }
      },
      error: (err) => {
        console.error('Error obteniendo el perfil del usuario', err);
      }
    });
  }

  toggleSidenav() {
    this.sidenavService.toggleSidenav();
  }

  logout(): void {
    this.authService.clearSession();
  }
}
