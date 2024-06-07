import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  stats = [
    { title: 'Usuarios', count: 150, icon: 'person' },
    { title: 'Proyectos', count: 34, icon: 'work' },
    { title: 'Tareas', count: 123, icon: 'assignment' },
    { title: 'Notificaciones', count: 12, icon: 'notifications' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
