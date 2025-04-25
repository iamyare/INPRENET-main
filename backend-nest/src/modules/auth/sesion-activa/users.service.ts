import { Injectable } from '@nestjs/common';

// Define una interfaz para el usuario simulado
interface MockUser {
  idUsuarioEmpresa: number;
  username: string;
  password?: string; // Hacer la contraseña opcional si no siempre está presente
  token: string | null;
  userAgent: string | null;
}

@Injectable()
export class UsersService {
  // Usa la interfaz MockUser y cambia userId a idUsuarioEmpresa (number)
  private users: MockUser[] = [
    // Ejemplo de usuarios
    { idUsuarioEmpresa: 1, username: 'user1', password: 'pass1', token: null, userAgent: null },
    { idUsuarioEmpresa: 2, username: 'user2', password: 'pass2', token: null, userAgent: null },
  ];

  async findOne(username: string): Promise<MockUser | undefined> {
    return this.users.find(user => user.username === username);
  }

  // Cambia el parámetro a number
  async findById(idUsuarioEmpresa: number): Promise<MockUser | undefined> {
    return this.users.find(user => user.idUsuarioEmpresa === idUsuarioEmpresa);
  }

  // Cambia el parámetro a number
  async updateUserToken(idUsuarioEmpresa: number, token: string, userAgent: string): Promise<void> {
    const user = await this.findById(idUsuarioEmpresa);
    if (user) {
      user.token = token;
      user.userAgent = userAgent;
    }
  }
}