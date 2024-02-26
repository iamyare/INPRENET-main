import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";


@Entity()
export class Net_Beneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio: string;

    @Column('varchar2', { length: 30, nullable: false })
    nombre_beneficio: string;

    @Column('varchar2', { length: 200, nullable: false })
    descripcion_beneficio: string; 

    @Column()
    periodicidad: string;

    @Column('number', { nullable: false, default: 100000 })
    numero_rentas_max?: number;

    @OneToMany(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.beneficio)
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];
}