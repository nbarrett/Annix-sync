import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenvConfig({ path: '.env' });

const config: DataSourceOptions = {
    type: 'postgres',
    host: `${process.env.DATABASE_HOST}`,
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: `${process.env.DATABASE_USERNAME}`,
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`,
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    migrations: [ "src/migrations/*.ts"],
    synchronize: true,
}

export default registerAs('typeorm', () => config as TypeOrmModuleOptions)
export const connectionSource = new DataSource(config);