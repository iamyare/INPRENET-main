import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    // Ejemplo de usuarios
    { userId: '1', username: 'user1', password: 'pass1', token: null, userAgent: null },
    { userId: '2', username: 'user2', password: 'pass2', token: null, userAgent: null },
  ];

  async findOne(username: string) {
    return this.users.find(user => user.username === username);
  }

  async findById(userId: string) {
    return this.users.find(user => user.userId === userId);
  }

  async updateUserToken(userId: string, token: string, userAgent: string) {
    const user = await this.findById(userId);
    if (user) {
      user.token = token;
      user.userAgent = userAgent;
    }
  }
}