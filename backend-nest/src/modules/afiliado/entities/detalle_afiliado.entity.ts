import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsString } from "class-validator";
import { Net_Afiliado } from "./net_afiliado";

@Entity()
export class Net_Detalle_Afiliado {
    @PrimaryGeneratedColumn('uuid')
    id_detalle_afiliado: string;

    @Column('varchar2', { length: 40, nullable: true })
    tipo_afiliado: string;

    @Column('number', { nullable: true })
    porcentaje: number;
    
    // Relación Uno a Muchos consigo mismo
    @OneToMany(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.padreIdAfiliado)
    hijos: Net_Detalle_Afiliado[];

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.hijos, { cascade: true })
    @JoinColumn({ name: 'id_detalle_afiliado_padre' })
    @IsString()
    padreIdAfiliado: Net_Detalle_Afiliado;

    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.detalleAfiliado, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Net_Afiliado;
    
}