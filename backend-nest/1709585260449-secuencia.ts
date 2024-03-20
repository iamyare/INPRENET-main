import { MigrationInterface, QueryRunner } from "typeorm";

export class Secuencia1709585260449 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE seq_beneficio_planilla
            START WITH 1
            INCREMENT BY 1
            NOCACHE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE seq_beneficio_planilla`);
    }

}
