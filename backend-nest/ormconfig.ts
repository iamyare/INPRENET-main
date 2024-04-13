import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const env = process.env.NODE_ENV || 'development';

const dataSource = new DataSource({
    type: 'oracle',
    host: 'localhost',
    port: 1521,
    username: 'c##test',
    password: '12345678',
    database: 'SYSJUB',
    entities: ['src/**/**/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*.ts'],
});


export default dataSource;
