import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSession } from './user_sessions.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];
}
