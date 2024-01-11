import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad } from 'typeorm';
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

    @ManyToOne(() => Institucion, institucion => institucion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'id_institucion' })
    institucion: Institucion;

    @Column('varchar2', { length: 20, nullable: false })
    monto_deduccion: string;

    @Column('varchar2', { length: 20, nullable: true })
    estado_aplicacion: string;

    @Column('varchar2', { length: 20, nullable: false })
    anio: string;

    @Column('varchar2', { length: 20, nullable: false })
    mes: string;

    @Column('number', {nullable: true })
    monto_aplicado: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha_aplicado: Date;

    deducciones: any[];
    temp: any = []
    @AfterInsert()
    async logSalarioBase() {
        const valorMinimo = 100; 
        this.deducciones = [{
            id_afiliado: this.afiliado?.id_afiliado,
            salario_base: this.afiliado.salario_base - valorMinimo,
            nombre_institucion: this.institucion?.nombre_institucion, // Asegúrate de que 'nombre' es el campo correcto
            monto_deduccion: this.monto_deduccion
        }];
        
        // Calculando salario neto y asignaciones
        const resultado = calcularSalarioNeto(this.deducciones, valorMinimo);
    
        // Actualizar el arreglo temp con nuevos afiliados o asignaciones
        this.deducciones.forEach(deduccion => {
            let afiliadoEncontrado = this.temp.find(afiliado => afiliado.id_afiliado === deduccion.id_afiliado);
    
            if (!afiliadoEncontrado) {
                // Si el afiliado no existe en temp, agregarlo con su primera asignación
                this.temp.push({
                    id_afiliado: deduccion.id_afiliado,
                    asignaciones: [{
                        nombre_institucion: deduccion.nombre_institucion,
                        monto_deduccion: deduccion.monto_deduccion
                    }]
                });
            } else {
                // Si el afiliado ya existe, agregar la nueva asignación a su lista
                afiliadoEncontrado.asignaciones.push({
                    nombre_institucion: deduccion.nombre_institucion,
                    monto_deduccion: deduccion.monto_deduccion
                });
            }
        });
    
    }
}

interface DeduccionInfo {
    id_afiliado: string;
    salario_base: number;
    nombre_institucion: string;
    monto_deduccion: number;
}

interface Asignacion {
    nombre_institucion: string;
    valor_utilizado: number;
    valor_no_utilizado: number;
}

function calcularSalarioNeto(deducciones: DeduccionInfo[], valorMinimo: number): any[] {
    const resultados: any[] = [];

    deducciones.forEach((deduccion) => {
        let afiliado = resultados.find(a => a.idAfiliado === deduccion.id_afiliado);

        if (!afiliado) {
            afiliado = {
                idAfiliado: deduccion.id_afiliado,
                salarioRestante: deduccion.salario_base,
                asignaciones: []
            };
            resultados.push(afiliado);
        }

        const montoDeduccion = Math.min(afiliado.salarioRestante - valorMinimo, deduccion.monto_deduccion);
        afiliado.salarioRestante -= montoDeduccion;
        afiliado.salarioRestante = Math.max(afiliado.salarioRestante, valorMinimo);

        const asignacionExistenteIndex = afiliado.asignaciones.findIndex(asignacion => asignacion.nombre_institucion === deduccion.nombre_institucion);

        if (asignacionExistenteIndex !== -1) {
            afiliado.asignaciones[asignacionExistenteIndex].valor_utilizado += montoDeduccion;
            afiliado.asignaciones[asignacionExistenteIndex].valor_no_utilizado = deduccion.monto_deduccion;
        } else {
            afiliado.asignaciones.push({
                nombre_institucion: deduccion.nombre_institucion,
                valor_utilizado: montoDeduccion,
                valor_no_utilizado: deduccion.monto_deduccion
            });
        }
    });

    return resultados;
}



// Ejemplo de uso
/* const salarioBase = 5000;
const valorMinimo = 100;
const deducciones = [
    { nombre: 'Prestamos de inprema', monto: 1000 },
    { nombre: 'retencion inprema', monto: 2000 },
    { nombre: 'asociacion de jubilados', monto: 800 }
];

const resultadoCalculo = calcularSalarioNeto(salarioBase, deducciones, valorMinimo);

console.log('Salario Restante:', resultadoCalculo.salarioRestante);
console.log('Asignaciones:', resultadoCalculo.asignaciones); */


/* 
function calcularSalarioNeto(deducciones, valorMinimo) {
    let salarioRestante = deducciones.salario_base;
    const asignaciones = {};

    deducciones.forEach((deducciones) => {
        const montoDeduccion = Math.min(salarioRestante - valorMinimo, deducciones.monto_deduccion);
        salarioRestante -= montoDeduccion;
       deducciones.monto_deduccion -= montoDeduccion;
        asignaciones[deducciones.nombre_institucion] = {
            valor_utilizado: montoDeduccion,
            valor_no_utilizado: deducciones.monto_deduccion
        };
    });

    salarioRestante = Math.max(salarioRestante, valorMinimo);

    console.log(salarioRestante);
    console.log(valorMinimo);
    

    // return { salarioRestante, asignaciones }; 
*/