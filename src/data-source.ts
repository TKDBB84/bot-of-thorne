import { DataSource } from 'typeorm';
import { allEntities } from './entities/index.js';

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env['TYPEORM_HOST'] ?? '',
  port: 3306,
  username: process.env['TYPEORM_USERNAME'] ?? '',
  password: process.env['TYPEORM_PASSWORD'] ?? '',
  database: process.env['TYPEORM_DATABASE '] ?? '',
  synchronize: false,
  logging: false,
  entities: allEntities,
});

export default async function getDataSource(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}
