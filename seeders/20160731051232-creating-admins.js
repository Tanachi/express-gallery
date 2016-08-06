'use strict';

module.exports = {
up : function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      username: 'Tyler',
      password : 'full',
      createdAt : new Date(),
      updatedAt : new Date()
    },{
      username: 'Fang',
      password : 'eryn',
      createdAt : new Date(),
      updatedAt : new Date()
    },{
      username: 'Sherman',
      password : 'german',
      createdAt : new Date(),
      updatedAt : new Date()
    }], {});
  },

  down : function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', []);
  }
};
