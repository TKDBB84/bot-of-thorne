import { DataSource } from 'typeorm';
import { allEntities } from './entities/index.js';

const dataSource = await new DataSource({
  type: 'mariadb',
  host: process.env['TYPEORM_HOST'] ?? 'localhost',
  port: +(process.env['TYPEORM_HOST'] ?? 3306),
  username: process.env['TYPEORM_USERNAME'] ?? 'cotbot',
  password: process.env['TYPEORM_PASSWORD'] ?? '',
  database: process.env['TYPEORM_DATABASE '] ?? 'cotbot',
  synchronize: true, // !!process.env['TYPEORM_SYNC'],
  logging: true, // !!process.env['TYPEORM_LOGGING'],
  entities: allEntities,
}).initialize();

export default dataSource;
