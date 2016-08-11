'use strict';

var faker = require('faker');

var generator = [];

for(var i = 0; i < 10; i ++){
  generator.push({
    url: faker.image.imageUrl(),
    description: faker.hacker.noun() +' ' + faker.hacker.verb() + ' ' + faker.hacker.ingverb() + ' '
    + faker.hacker.adjective() + ' ' + faker.hacker.phrase(),
    createdAt : new Date(),
    updatedAt : new Date(),
    user_id: Math.floor(Math.random() * 5) + 1
  });
}
module.exports = {
up : function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Photos', generator, {});
  },

  down : function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Photos');
  }
};
