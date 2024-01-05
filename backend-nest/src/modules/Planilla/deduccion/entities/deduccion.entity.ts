import { HistorialSalario } from 'src/afiliado/entities/historialSalarios.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Deduccion {

    @PrimaryGeneratedColumn('uuid')
    id_deduccion : string;

    @Column('varchar2', { length: 100, nullable: false })
    descripcion_deduccion : string;

    @Column('varchar2', { length: 20, nullable: true })
    estado_deduccion : string;

    @Column('number', {nullable: false })
    total_deduccion: number;

    @OneToMany(() => HistorialSalario, historialSalario => historialSalario.deduccion, { cascade: true })
    historialSalario : HistorialSalario[];
}
