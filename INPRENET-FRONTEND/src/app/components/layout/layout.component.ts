import { Component, OnInit } from '@angular/core';
import { Section } from './menu-config';
import { SidenavService } from 'src/app/services/sidenav.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  menuConfig: Section[] = [];
  expandedPanel: any = null;

  constructor(private sidenavService: SidenavService) {}

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig();
  }

  setExpandedPanel(panel:any): void {
    this.expandedPanel = panel;
  }

  togglePanel(panel:any): void {
    this.expandedPanel = this.expandedPanel === panel ? null : panel;
  }

  selectChild(panel:any): void {
    this.expandedPanel = panel;
  }
}
