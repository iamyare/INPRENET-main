import { Component, OnInit } from '@angular/core';
import { Section, MenuItem } from './menu-config';
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
    this.menuConfig = this.getAccessibleMenuConfig();
  }

  getAccessibleMenuConfig(): Section[] {
    const originalMenuConfig = this.sidenavService.getMenuConfig();
    const accessibleMenu: Section[] = [];
    for (const section of originalMenuConfig) {
      const accessibleItems: MenuItem[] = [];
      for (const item of section.items) {
        const accessibleChildren: MenuItem[] = [];
        if (item.children) {
          for (const child of item.children) {
            const hasAccess = this.permisosService.userHasAccess(section.name, child.route!);
            if (hasAccess) {
              accessibleChildren.push(child);
            }
          }
        }
        if (accessibleChildren.length > 0 || !item.children) {
          accessibleItems.push({ ...item, children: accessibleChildren });
        }
      }
      if (accessibleItems.length > 0) {
        accessibleMenu.push({ ...section, items: accessibleItems });
      }
    }
    return accessibleMenu;
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
