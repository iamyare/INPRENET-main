import { MigrationInterface, QueryRunner } from "typeorm";

export class NumRentFechaEfectividadCamNom1739468541338 implements MigrationInterface {
    name = 'NumRentFechaEfectividadCamNom1739468541338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_BENEFICIO_AFILIADO" RENAME COLUMN "FECHA_CALCULO" TO "FECHA_EFECTIVIDAD"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_BENEFICIO_AFILIADO" RENAME COLUMN "NUM_RENTAS_APLICADAS" TO "NUM_RENTAS_APROBADAS"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "NET_DETALLE_BENEFICIO_AFILIADO" RENAME COLUMN "FECHA_EFECTIVIDAD" TO "FECHA_CALCULO"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_BENEFICIO_AFILIADO" RENAME COLUMN "NUM_RENTAS_APROBADAS" TO "NUM_RENTAS_APLICADAS"`);
    }

}
