'use strict';
module.exports = function(sequelize, DataTypes) {
  var Photos = sequelize.define('Photos', {
    author: DataTypes.STRING,
    url: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Photos;
};