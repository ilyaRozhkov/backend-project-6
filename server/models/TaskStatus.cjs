// @ts-check

const objectionUnique = require('objection-unique');
const BaseModel = require('./BaseModel.cjs');

const unique = objectionUnique({ fields: ['name'] });

module.exports = class TaskStatus extends unique(BaseModel) {
  static get tableName() {
    return 'taskStatuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }
};
