import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({
  name: 'NET_BITACORA_CAMBIOS',
})
export class Net_Bitacora_Cambios {
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_BITACORA',
    primaryKeyConstraintName: 'PK_ID_BITACORA_NET_BITACORA_CAMBIOS'
  })
  id_bitacora: number;

  @Column({
    type: 'varchar2',
    length: 255,
    nullable: false,
    name: 'TABLA_AFECTADA'
  })
  tabla_afectada: string;

  @Column({
    type: 'varchar2',
    length: 50,
    nullable: false,
    name: 'TIPO_CAMBIO'
  })
  tipo_cambio: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'FECHA_CAMBIO'
  })
  fecha_cambio: Date;

  @Column({
    type: 'varchar2',
    length: 255,
    nullable: true,
    name: 'USUARIO'
  })
  usuario: string;

  @Column({
    type: 'clob',
    nullable: true,
    name: 'VALORES_ANTERIORES'
  })
  valores_anteriores: string;

  @Column({
    type: 'clob',
    nullable: true,
    name: 'VALORES_NUEVOS'
  })
  valores_nuevos: string;

  @Column({
    type: 'number',
    nullable: true,
    name: 'ID_REGISTRO_AFECTADO'
  })
  id_registro_afectado: number;
}
