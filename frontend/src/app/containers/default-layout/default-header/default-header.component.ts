import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ClassToggleService, HeaderComponent } from '@coreui/angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss']
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  @Input() sidebarId: string = "sidebar";
  public newMessages = new Array(4);
  public newTasks = new Array(5);
  public newNotifications = new Array(5);
  public userPhotoUrl: string | null = null;

  constructor(private classToggler: ClassToggleService, private authService: AuthService) {
    super();
  }

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

  logout(): void {
    this.authService.clearSession();
  }
}
