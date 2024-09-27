import { Component, OnInit } from '@angular/core';
import { Section } from './menu-config';
import { SidenavService } from 'src/app/services/sidenav.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  menuConfig: Section[] = [];
  expandedPanel: any = null;

  constructor(private sidenavService: SidenavService, private authService: AuthService) { }

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig();
    /* // Obtén los roles y módulos del usuario
    const rolesModulos = this.authService.getUserRolesAndModules();

    // Filtra el menú con base en los roles y módulos
    this.menuConfig = this.sidenavService.getMenuConfig().filter(section => {
      // Condición para mostrar el menú PLANILLA
      if (section.name === 'PLANILLA') {
        return rolesModulos.some(roleModulo =>
          roleModulo.modulo === 'PLANILLA' || roleModulo.rol === 'ADMINISTRADOR'
        );
      }

      // Condición para mostrar el menú AFILIACION
      if (section.name === 'AFILIACION') {
        return rolesModulos.some(roleModulo =>
          roleModulo.modulo === 'AFILIACION' || roleModulo.rol === 'ADMINISTRADOR'
        );
      }

      // Condición para mostrar el menú GESTIÓN DE PERSONAL
      if (section.name === 'GESTIÓN DE PERSONAL') {
        return rolesModulos.some(roleModulo =>
          roleModulo.rol.includes('ADMINISTRADOR')
        );
      }

      // Condición para mostrar el menú BENEFICIOS
      if (section.name === 'BENEFICIOS') {
        return rolesModulos.some(roleModulo =>
          roleModulo.modulo === 'BENEFICIOS' || roleModulo.rol === 'ADMINISTRADOR'
        );
      }

      // Mantén los demás menús sin cambios
      return true;
    }); */
  }

  setExpandedPanel(panel: any): void {
    this.expandedPanel = panel;
  }

  togglePanel(panel: any): void {
    this.expandedPanel = this.expandedPanel === panel ? null : panel;
  }

  selectChild(panel: any): void {
    this.expandedPanel = panel;
  }
}
