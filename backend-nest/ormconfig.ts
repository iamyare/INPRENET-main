import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'development.env' });
// La configuración de oracledb ya no es necesaria

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://neondb_owner:npg_jpPEqoFy5s2e@ep-round-hat-a2i4jhkf-pooler.eu-central-1.aws.neon.tech/neondb',
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  },
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
});
