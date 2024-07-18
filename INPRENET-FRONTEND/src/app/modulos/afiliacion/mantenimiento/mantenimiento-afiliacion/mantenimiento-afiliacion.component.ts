import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mantenimiento-afiliacion',
  templateUrl: './mantenimiento-afiliacion.component.html',
  styleUrls: ['./mantenimiento-afiliacion.component.scss']
})
export class MantenimientoAfiliacionComponent {

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
