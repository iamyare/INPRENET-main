import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity({ name: 'NET_INVALID_REFRESH_TOKEN' })
export class Net_Invalid_Refresh_Token {
  
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID', primaryKeyConstraintName: 'PK_net_invalid_refresh_token_id' })
  id: number;

  @Column('varchar', { name: 'TOKEN', nullable: false, unique: true })
  token: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
