import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity'; 

@Entity({ name: 'user_sessions' })
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 500 })
  token: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
