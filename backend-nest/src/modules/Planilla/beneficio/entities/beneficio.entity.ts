import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BeneficioPlanilla } from "../../beneficio_planilla/entities/beneficio_planilla.entity";

@Entity()
export class Beneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio : string;

    @Column('varchar2', { length: 30, nullable: false })
    nombre_beneficio : string;

    @Column('varchar2', { length: 200, nullable: false })
    descripcion_beneficio : string;

    @Column()
    estado: string;

    @Column('number', { nullable: false })
    numero_rentas_max: number;



    @OneToMany(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.beneficio)
    beneficioPlanilla : BeneficioPlanilla[];
}