import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";
import { Net_Clasificacion_Beneficios } from "../../planilla/entities/net_clasificacion_beneficios.entity";
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