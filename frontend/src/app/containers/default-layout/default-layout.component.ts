import { Component, OnInit } from '@angular/core';
import { navItems as originalNavItems } from '../default-layout/_nav';
import { INavData } from '@coreui/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems: INavData[] = [];
  private rolesModulos: { rol: string, modulo: string }[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.rolesModulos = this.authService.getRolesModulos();
    this.loadNavItems();
  }

  private loadNavItems(): void {
    this.navItems = JSON.parse(JSON.stringify(originalNavItems));

    const isAdmin = this.rolesModulos.some(rm => rm.rol.toUpperCase() === 'ADMINISTRADOR');

    if (!isAdmin) {
      const gestionIndex = this.navItems.findIndex(item => item.name === 'Gestión De Personal');
      if (gestionIndex !== -1) {
        this.navItems.splice(gestionIndex, 1);
      }
    }
  }
}
