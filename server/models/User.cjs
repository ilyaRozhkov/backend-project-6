// @ts-check

const objectionUnique = require('objection-unique');
const BaseModel = require('./BaseModel.cjs');
const encrypt = require('../lib/secure.cjs');

const unique = objectionUnique({ fields: ['email'] });

module.exports = class User extends unique(BaseModel) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 3 },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
};
