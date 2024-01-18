import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad, Unique } from 'typeorm';
import { Deduccion } from "../../deduccion/entities/deduccion.entity";
import { Afiliado } from "src/afiliado/entities/afiliado.entity";
import { Institucion } from "src/modules/Empresarial/institucion/entities/institucion.entity";

@Entity()
export class DetalleDeduccion {
    
    @PrimaryGeneratedColumn('uuid')
    id_ded_deduccion: string;
    
    @ManyToOne(() => Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'id_deduccion' })
    deduccion: string;
    
    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: string;
    
    @ManyToOne(() => Institucion, institucion => institucion.detalleDeduccion, { cascade: true})
    @JoinColumn({ name: 'id_institucion' })
    institucion: Institucion;

    @Column('varchar2', { length: 20, nullable: false })
    monto_total: string;

    @Column('number', {nullable: true})
    monto_aplicado: number;

    @Column('varchar2', { length: 20, nullable: true })
    estado_aplicacion: string;

    @Column('varchar2', { length: 20, nullable: false})
    anio: string;

    @Column('varchar2', { length: 20, nullable: false})
    mes: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_aplicado: Date;
}

/* interface DatosInfo {
    id_afiliado: string;
    salario_base: number;
    nombre_institucion: string;
    monto_deduccion: number;
} */
 
interface Asignacion {
    nombre_institucion: string;
    montoDeduccion: number;
}
