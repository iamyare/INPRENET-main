import { MigrationInterface, QueryRunner } from "typeorm";

export class SectorCentro21720278694447 implements MigrationInterface {
    name = 'SectorCentro21720278694447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" DROP CONSTRAINT "FK_ID_PLANILLA_DETDED"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" RENAME COLUMN "ID_PLANILLA" TO "ID_DETALLE_PAGO_BENEFICIO"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" ADD CONSTRAINT "FK_ID_DETALLE_PAGO_BENEFICIO_DETDED" FOREIGN KEY ("ID_DETALLE_PAGO_BENEFICIO") REFERENCES "NET_DETALLE_PAGO_BENEFICIO" ("ID_BENEFICIO_PLANILLA")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" DROP CONSTRAINT "FK_ID_DETALLE_PAGO_BENEFICIO_DETDED"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" RENAME COLUMN "ID_DETALLE_PAGO_BENEFICIO" TO "ID_PLANILLA"`);
        await queryRunner.query(`ALTER TABLE "NET_DETALLE_DEDUCCION" ADD CONSTRAINT "FK_ID_PLANILLA_DETDED" FOREIGN KEY ("ID_PLANILLA") REFERENCES "NET_PLANILLA" ("ID_PLANILLA")`);
    }

}
