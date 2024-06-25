import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil-edicion-seguridad',
  templateUrl: './perfil-edicion-seguridad.component.html',
  styleUrls: ['./perfil-edicion-seguridad.component.scss']
})
export class PerfilEdicionSeguridadComponent implements OnInit {
  @Input() userId?: string;

  constructor() { }

  ngOnInit(): void {
    // Cargar información de seguridad del usuario usando el userId
    console.log('Cargar información de seguridad del usuario con ID:', this.userId);
  }
}
