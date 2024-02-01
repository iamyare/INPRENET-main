import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsString } from "class-validator";
import { Afiliado } from "./afiliado";

@Entity()
export class DetalleAfiliado {
    @PrimaryGeneratedColumn('uuid')
    id_detalle_afiliado: string;

    @Column('varchar2', { length: 40, nullable: true })
    tipo_afiliado: string;

    @Column('number', { nullable: true })
    porcentaje: number;
    
    // Relación Uno a Muchos consigo mismo
    @OneToMany(() => DetalleAfiliado, detalleAfiliado => detalleAfiliado.padreIdAfiliado)
    hijos: DetalleAfiliado[];

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => DetalleAfiliado, detalleAfiliado => detalleAfiliado.hijos, { cascade: true })
    @JoinColumn({ name: 'id_detalle_afiliado_padre' })
    @IsString()
    padreIdAfiliado: DetalleAfiliado;

    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleAfiliado, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;
    
    
    
}