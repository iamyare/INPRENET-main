import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsString } from "class-validator";
import { Net_Afiliado } from "./net_afiliado";
import { Net_Tipo_Afiliado } from "./net_tipo_afiliado.entity";

@Entity()
export class Net_Detalle_Afiliado {
    @PrimaryColumn()
    id_afiliado: string;
    
    @PrimaryColumn()
    id_detalle_afiliado: string;

    @Column('number', { nullable: true })
    porcentaje: number;
    
    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.detalleAfiliado, { cascade: true })
    @JoinColumn({ name: 'id_afiliado', referencedColumnName: 'id_afiliado' })
    afiliado: Net_Afiliado;
    
    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.id_detalle_afiliado, { cascade: true })
    @JoinColumn({ name: 'id_detalle_afiliado_padre', referencedColumnName: 'id_afiliado'})
    @JoinColumn({ name: 'id_detalle_afiliado', referencedColumnName: 'id_detalle_afiliado'})
    padreIdAfiliado: Net_Detalle_Afiliado;

    @ManyToOne(() => Net_Tipo_Afiliado, tipoAfiliado => tipoAfiliado.detallesAfiliados)
    @JoinColumn({ name: 'tipo_afiliado_id' }) // Esta columna almacena la relación
    tipoAfiliado: Net_Tipo_Afiliado;

    @OneToMany(() => Net_Detalle_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.afiliado)
    detalleBeneficioAfiliado: Net_Detalle_Afiliado[];

    
}