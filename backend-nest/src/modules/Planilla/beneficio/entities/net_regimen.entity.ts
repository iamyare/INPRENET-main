import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "./net_beneficio.entity";


@Entity({ name: 'NET_REGIMEN' })
export class Net_Regimen {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REGIMEN', primaryKeyConstraintName: 'PK_id_regimen' })
    id_regimen: string;

    @Column('varchar2', { length: 60, nullable: false, name: 'ley' })
    ley: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'CODIGO_LEY' })
    codigo_ley: string;

    @OneToMany(() => Net_Beneficio, beneficio => beneficio.regimen)
    beneficio: Net_Beneficio[];

}