import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";


@Entity()
export class Net_Beneficio {

    @PrimaryGeneratedColumn('uuid')
    ID_BENEFICIO: string;

    @Column('varchar2', { length: 30, nullable: false })
    NOMBRE_BENEFICIO: string;

    @Column('varchar2', { length: 200, nullable: false })
    DESCRIPCION_BENEFICIO: string; 

    @Column()
    PERIODICIDAD: string;

    @Column('number', { nullable: false, default: 100000 })
    NUMERO_RENTAS_MAX?: number;

    @OneToMany(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.beneficio)
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];
}