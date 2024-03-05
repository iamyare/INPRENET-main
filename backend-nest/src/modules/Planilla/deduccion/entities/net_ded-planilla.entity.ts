import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";

@Entity()
export class Net_Ded_Planilla {
    
    @PrimaryGeneratedColumn('uuid')
    ID_DED_PLANILLA: string;

    @Column('varchar2', { length: 100, nullable: false })
    NOMBRE_DEDUCCION: string;

    @Column('varchar2', { length: 100, nullable: false })
    COD_DEDUCCION: string;

    @Column('varchar2', { length: 100, nullable: false })
    DESCRIPCION_DEDUCCION: string;

    @ManyToOne(() => Net_TipoPlanilla, net_TipoPlanilla => net_TipoPlanilla.net_Ded_Planilla)
    @JoinColumn({ name: 'ID_TIPO_PLANILLA' }) // Asegúrate de que este nombre de columna sea correcto
    net_TipoPlanilla: Net_TipoPlanilla;
}