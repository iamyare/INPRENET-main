import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { net_persona } from '../../Persona/entities/net_persona.entity';

@Entity({ name: 'NET_TIPO_IDENTIFICACION' })
export class Net_Tipo_Identificacion {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_IDENTIFICACION', primaryKeyConstraintName: 'PK_id_iden_tipoIden' })
  id_identificacion: number;

  @Column('varchar', { length: 40, nullable: true, name: 'TIPO_IDENTIFICACION' })
  tipo_identificacion: string;

  @OneToMany(() => net_persona, persona => persona.tipoIdentificacion)
  personas: net_persona[];
}
