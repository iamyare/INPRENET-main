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
    deduccion: Deduccion;
    
    @ManyToOne(() => Afiliado, afiliado => afiliado.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;
    
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

    /* datos: any;
    temp: any = []
    @AfterInsert()
    async logSalarioBase() {
        this.datos = {
            id_afiliado: this.afiliado?.id_afiliado,
            dni: this.afiliado?.dni,
            salario_base: this.afiliado.salario_base,
            nombre_institucion: this.institucion?.nombre_institucion,
            monto_deduccion: this.monto_deduccion
        };

        const asignacion: Asignacion = {
            nombre_institucion: this.datos.nombre_institucion,
            montoDeduccion: this.datos.monto_deduccion
        };
        
        let resultados: any = {
            idAfiliado: this.datos.id_afiliado,
            salario_base: this.datos.salario_base,
            deduccion: asignacion
        };

        this.temp = resultados
        
    } */
}

/* interface DatosInfo {
    id_afiliado: string;
    salario_base: number;
    nombre_institucion: string;
    monto_deduccion: number;
}
 
interface Asignacion {
    nombre_institucion: string;
    montoDeduccion: number;
} */