import { Injectable } from '@nestjs/common';
import { UserSession } from 'src/modules/bitacora/entities/user_sessions.entity';
import { Repository, DataSource } from 'typeorm';


@Injectable()
export class UserSessionRepository extends Repository<UserSession> {
  constructor(private readonly dataSource: DataSource) {
    super(UserSession, dataSource.createEntityManager());
  }

}
