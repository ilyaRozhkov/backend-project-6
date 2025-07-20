// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import encrypt from '../../server/lib/secure.cjs';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

// Создание пользовтелей для тестирования
const createRandomUser = () => (
  {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordDigest: faker.internet.password(),
  }
);

// console.log(JSON.stringify(faker.helpers.multiple(createRandomUser, { count: 1 })[0], null, 2));

const createTestData = async (user) => {
  const newUser = faker.helpers.multiple(createRandomUser, { count: 1 })[0];
  const data = {
    users: {
      new: newUser,
      existing: user,
    },
  };
  const dataJSON = JSON.stringify(data, null, 2);
  const pathFile = new URL(getFixturePath('testData.json'), import.meta.url);
  await fs.promises.writeFile(pathFile, dataJSON);
};

export const createUsers = async () => {
  const users = faker.helpers.multiple(createRandomUser, { count: 5 });
  await createTestData(users[0]);
  // eslint-disable-next-line no-param-reassign
  users.forEach((user) => { user.passwordDigest = encrypt(user.passwordDigest); });
  const usersJSON = JSON.stringify(users, null, 2);
  const pathFile = new URL(getFixturePath('users.json'), import.meta.url);
  await fs.promises.writeFile(pathFile, usersJSON);
};

// await createUsers();

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;

  // получаем данные из фикстур и заполняем БД
  await knex('users').insert(getFixtureData('users.json'));
  await knex('taskStatuses').insert(getFixtureData('statuses.json'));
};
