// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

export const development = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true,
  migrations,
};

export const test = {
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  // debug: true,
  migrations,
};

export const production = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST, // Хост базы данных
    port: process.env.DB_PORT, // Порт базы данных
    user: process.env.DB_USER, // Имя пользователя базы данных
    password: process.env.DB_PASSWORD, // Пароль пользователя
    database: process.env.DB_NAME, // Имя базы данных
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations,
};
