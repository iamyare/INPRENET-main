import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'development.env' });
import * as oracledb from 'oracledb';
oracledb.initOracleClient({ configDir: '', libDir: '', errorDir: '' });

export const AppDataSource = new DataSource({
  type: 'oracle',
  connectString: process.env.CONNECT_STRING,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
  
}); 
