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
  ) { }

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig().filter(section => {
      let isSectionVisible = false;

      switch (section.name.toLowerCase()) {
        case 'afiliación':
          isSectionVisible = this.permisosService.tieneAccesoCompletoPlanilla() || this.permisosService.tieneAccesoLimitadoPlanilla();
          if (isSectionVisible) {
            section.items.forEach(item => {
              item.children = item.children?.filter(child => {
                if (['Nuevo Centro Educativo', 'Ver Centro Educativo'].includes(child.title)) {
                  return false;
                }
                return this.permisosService.tieneAccesoAChilPlanilla(child.title);
              });
            });
          }
          break;

        case 'planilla':
          isSectionVisible = this.permisosService.tieneAccesoCompletoPlanilla() || this.permisosService.tieneAccesoLimitadoPlanilla();
          if (isSectionVisible) {
            section.items.forEach(item => {
              item.children = item.children?.filter(child => {
                return this.permisosService.tieneAccesoAChilPlanilla(child.title);
              });
            });
          }
          break;

        case 'gestión de personal':
          isSectionVisible = false
            break;

        case 'beneficios':
          isSectionVisible = true;
          section.items.forEach(item => {
            item.children = item.children?.filter(child => {
              return this.permisosService.tieneAccesoAChilPlanilla(child.title);
            });
          });
          break;

        case 'cuentas inprema':
          isSectionVisible = false
          break;

          case 'escalafón':
            isSectionVisible = false
            break;

        default:
          isSectionVisible = false;
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
