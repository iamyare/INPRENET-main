import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const env = process.env.NODE_ENV || 'development';

const dataSource = new DataSource({
    type: 'oracle',
    connectString: process.env.CONNECT_STRING,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: ['src/**/**/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*.ts'],
});


export default dataSource;
