import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'NET_DETALLE_ENVIO_ESCALAFON' })
export class net_detalle_envio_escalafon {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DET_ENV_ESC', primaryKeyConstraintName: 'PK_ID_DET_ENV_ESC' })
    id_det_env_esc: number;

    @Column('varchar2', { length: 20, nullable: false, name: 'DNI',   })
    dni: string;

    @Column('number', { nullable: true, name: 'NUMERO_PRESTAMO' })
    numero_prestamo: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'CUOTA' })
    cuota: number;

    @Column('number', { nullable: true, name: 'ANIO' })
    anio: number;

    
    @Column('number', { nullable: true, name: 'MES' })
    mes: number;
}