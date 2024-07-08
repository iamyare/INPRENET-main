import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav.service';
import { Section } from '../layout/menu-config';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  menuConfig: Section[] = [];

  constructor(private sidenavService: SidenavService) {}

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig();
  }
}
