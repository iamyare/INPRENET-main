import { Net_Persona } from '../../afiliado/entities/Net_Persona';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

@Entity({ name: 'NET_TIPO_IDENTIFICACION' })
export class Net_TipoIdentificacion {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_IDENTIFICACION', primaryKeyConstraintName: 'PK_id_iden_tipoIden' })
    id_identificacion: number;

    @Column('varchar', { length: 40, nullable: true, name: 'TIPO_IDENTIFICACION' })
    tipo_identificacion: string;

    @OneToMany(() => Net_Persona, afiliado => afiliado.tipoIdentificacion)
    afiliado: Net_Persona[];

}