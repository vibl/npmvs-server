require('dotenv').config();
const { Model } = require('objection');
const Knex = require('knex');
const pg = require('pg');

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION,
};

// Give the knex object to objection.
Model.knex(knex);

// Person model.
class Person extends Model {
  static get tableName() {
    return 'persons';
  }

  static get relationMappings() {
    return {
      children: {
        relation: Model.HasManyRelation,
        modelClass: Person,
        join: {
          from: 'persons.id',
          to: 'persons.parentId'
        }
      }
    };
  }
}


// Create database schema. You should use knex migration files to do this.
// We create it here for simplicity.
async function createSchema() {
  const hasTable = await knex.schema.hasTable('persons');
  if (!hasTable) {
    return knex.schema.createTable('persons', (table) => {
      table.increments('id').primary();
      table.integer('parentId').references('persons.id');
      table.string('firstName');
    });
  }
}

async function main() {
  // Create some people.
  const sylvester = await Person.query().insertGraph({
    firstName: 'Sylvester',

    children: [
      {
        firstName: 'Sage'
      },
      {
        firstName: 'Sophia'
      }
    ]
  });

  console.log('created:', sylvester);

  // Fetch all people named Sylvester and sort them by id.
  // Load `children` relation eagerly.
  const sylvesters = await Person.query()
    .where('firstName', 'Sylvester')
    .eager('children')
    .orderBy('id');

  console.log('sylvesters:', sylvesters);
}

createSchema().then(() => main()).catch(console.error);