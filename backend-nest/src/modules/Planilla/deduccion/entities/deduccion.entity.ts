import { HistorialSalario } from 'src/afiliado/entities/historialSalarios.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';

@Entity()
export class Deduccion {

    @PrimaryGeneratedColumn('uuid')
    id_deduccion : string;

    @Column('varchar2', { length: 100, nullable: false })
    descripcion_deduccion : string;

    @Column('varchar2', { length: 40, nullable: true })
    tipo_deduccion : string;

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion : DetalleDeduccion[];
}
