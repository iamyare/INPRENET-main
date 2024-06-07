import { Component, OnInit } from '@angular/core';

interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [
    { name: 'Juan Pérez', email: 'juan.perez@example.com' },
    { name: 'Ana Gómez', email: 'ana.gomez@example.com' }
  ];
  displayedColumns: string[] = ['name', 'email', 'actions'];

  constructor() { }

  ngOnInit(): void { }

  addUser(): void {
    // Lógica para agregar un nuevo usuario
  }

  editUser(user: User): void {
    // Lógica para editar un usuario existente
  }

  deleteUser(user: User): void {
    // Lógica para eliminar un usuario
  }
}
