import { Component, OnInit } from '@angular/core';
import { navItems as originalNavItems } from '../default-layout/_nav';
import { INavData } from '@coreui/angular';
import { AuthService } from '../../services/auth.service'; // Asume que tienes un servicio de autenticación

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems: INavData[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadNavItems();
  }

  private loadNavItems(): void {
    this.navItems = JSON.parse(JSON.stringify(originalNavItems));
    const userRole = this.authService.getUserRole();
    if (userRole === 'ADMINISTRADOR') {
      this.navItems.splice(2, 0, {
        name: 'Beneficio',
        iconComponent: { name: 'cilMoney' },
        url: '/base',
        children: [
          { name: 'Nuevo Beneficio', url: '/Beneficio/nuevo-beneficio' },
          { name: 'Editar Beneficios', url: '/Beneficio/editar-beneficio' },
        ],
      });
    }
  }
}
