import { Component, OnInit } from '@angular/core';
import { Section } from './menu-config';
import { SidenavService } from 'src/app/services/sidenav.service';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  menuConfig: Section[] = [];
  expandedPanel: any = null;

  constructor(
    private sidenavService: SidenavService,
    private permisosService: PermisosService
  ) {}

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig().filter(section => {
      let isSectionVisible = false;

      switch (section.name.toLowerCase()) {
        case 'afiliación':
          isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion() || this.permisosService.tieneAccesoLimitadoAfiliacion();
          break;
        case 'planilla':
          isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion(); // Actualizar si hay método específico para PLANILLA
          break;
        case 'gestión de personal':
          isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion(); // Actualizar si hay método específico para este módulo
          break;
        case 'beneficios':
          isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion(); // Actualizar si hay método específico para BENEFICIOS
          break;
        case 'cuentas inprema':
          isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion(); // Actualizar si hay método específico para BENEFICIOS
          break;
        case 'escalafón':
            isSectionVisible = this.permisosService.tieneAccesoCompletoAfiliacion(); // Actualizar si hay método específico para BENEFICIOS
            break;
        default:
          isSectionVisible = false;
      }

      if (isSectionVisible) {
        section.items.forEach(item => {
          item.children = item.children?.filter(child => this.permisosService.tieneAccesoAChildAfiliacion(child.title));
        });
      }

      return isSectionVisible;
    });
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
