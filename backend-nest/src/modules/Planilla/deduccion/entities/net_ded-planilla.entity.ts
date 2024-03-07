import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";
import { Net_Detalle_Deduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";

@Entity()
export class Net_Deduc_Tipo_Planilla {
    
    @PrimaryGeneratedColumn('uuid')
    id_ded_deduccion: string;

    @Column('varchar2', { length: 100, nullable: false })
    nombre_deduccion: string;

    @Column('number', {unique:true, nullable: false })
    codigo_deduccion: number;

    @Column('varchar2', { length: 100, nullable: false })
    descripcion_deduccion: string;

    @ManyToOne(() => Net_TipoPlanilla, net_TipoPlanilla => net_TipoPlanilla.net_Ded_Planilla)
    @JoinColumn({ name: 'id_tipo_planilla' }) // Asegúrate de que este nombre de columna sea correcto
    net_TipoPlanilla: Net_TipoPlanilla;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.detDeduccion)
    detalleDeduccion: Net_Detalle_Deduccion[];

}