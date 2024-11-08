import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav.service';
import { Section } from '../layout/menu-config';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  menuConfig: Section[] = [];
  showImage: boolean = true;

  constructor(
    private sidenavService: SidenavService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.menuConfig = this.sidenavService.getMenuConfig();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showImage = this.router.url === '/home';
      }
    });
  }

  handleError() {
    console.error('Error al cargar la imagen.');
  }
}
