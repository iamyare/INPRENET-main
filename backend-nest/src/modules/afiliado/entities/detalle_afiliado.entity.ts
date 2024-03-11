import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsString } from "class-validator";
import { Net_Persona } from "./Net_Persona";
import { Net_Tipo_Afiliado } from "./net_tipo_afiliado.entity";

@Entity()
export class Net_Detalle_Afiliado {
    @PrimaryColumn()
    ID_AFILIADO: string;
    
    @PrimaryColumn()
    ID_DETALLE_AFILIADO: string;

    @Column('number', { nullable: true })
    PORCENTAJE: number;
    
    @ManyToOne(() => Net_Persona, afiliado => afiliado.detalleAfiliado, { cascade: true })
    @JoinColumn({ name: 'ID_AFILIADO', referencedColumnName: 'ID_AFILIADO' })
    afiliado: Net_Persona;
    
    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.ID_DETALLE_AFILIADO, { cascade: true })
    @JoinColumn({ name: 'ID_DETALLE_AFILIADO_PADRE', referencedColumnName: 'ID_AFILIADO'})
    @JoinColumn({ name: 'ID_DETALLE_AFILIADO', referencedColumnName: 'ID_DETALLE_AFILIADO'})
    padreIdAfiliado: Net_Detalle_Afiliado;

    @ManyToOne(() => Net_Tipo_Afiliado, tipoAfiliado => tipoAfiliado.detallesAfiliados)
    @JoinColumn({ name: 'ID_TIPO_AFILIADO' }) // Esta columna almacena la relación
    tipoAfiliado: Net_Tipo_Afiliado;

    @OneToMany(() => Net_Detalle_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.afiliado)
    detalleBeneficioAfiliado: Net_Detalle_Afiliado[];

    
}