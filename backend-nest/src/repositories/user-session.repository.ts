import { Injectable } from '@nestjs/common';
import { UserSession } from 'src/modules/bitacora/entities/user_sessions.entity';
import { Repository, DataSource } from 'typeorm';
import {User} from 'src/modules/bitacora/entities/user.entity';


@Injectable()
export class UserSessionRepository extends Repository<UserSession> {
  constructor(private readonly dataSource: DataSource) {
    super(UserSession, dataSource.createEntityManager());
  }

  async createSession(userId: number, token: string, userAgent: string, ipAddress: string): Promise<UserSession> {
    const session = this.create({ user: { userId }, token, userAgent, ipAddress });
    return this.save(session);
  }

  async findActiveSession(userId: number): Promise<UserSession | null> {
    return this.findOne({ where: { user: { userId } } });
  }

  async deleteSession(userId: number): Promise<void> {
    await this.delete({ user: { userId } });
  }

}
