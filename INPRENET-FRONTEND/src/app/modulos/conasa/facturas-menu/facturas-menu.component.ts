import { Component } from '@angular/core';

@Component({
  selector: 'app-facturas-menu',
  templateUrl: './facturas-menu.component.html',
  styleUrls: ['./facturas-menu.component.scss'],
})
export class FacturasMenuComponent {
  menuOptions = [
    { label: 'Subir Factura', route: '/home/conasa/menu-facturas-conasa/subir-factura', icon: 'upload_file', description: 'Sube una nueva factura al sistema.' },
    { label: 'Ver Facturas', route: '/home/conasa/menu-facturas-conasa/ver-facturas', icon: 'visibility', description: 'Consulta, descarga y administra las facturas existentes.' },
  ];
}
