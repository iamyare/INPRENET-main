import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";

@Entity()
export class Net_Tipo_Afiliado {

    @PrimaryGeneratedColumn('uuid')
    ID_TIPÓ_AFILIADO: string;

    @Column('varchar2', { length: 1000, nullable: false })
    TIPO_AFILIADO: string;

    @OneToMany(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.tipoAfiliado)
    detallesAfiliados: Net_Detalle_Afiliado[];
}