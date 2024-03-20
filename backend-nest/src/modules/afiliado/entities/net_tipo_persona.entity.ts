import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Afiliado } from "./Net_detalle_persona.entity";

@Entity({name:'NET_TIPO_PERSONA'})
export class Net_Tipo_Persona {

    @PrimaryGeneratedColumn({type: 'int', name: 'ID_TIPO_AFILIADO',  primaryKeyConstraintName: 'PK_id_tipoA_tipoA'})
    id_tipo_afiliado: number;

    @Column('varchar2', { length: 1000, nullable: false, name: 'TIPO_AFILIADO' })
    tipo_afiliado: string;

    @OneToMany(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.tipoAfiliado)
    detallesAfiliado: Net_Detalle_Afiliado[];
}