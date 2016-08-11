'use strict';
module.exports = function(sequelize, DataTypes) {
  var Photos = sequelize.define('Photos', {
    url: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        models.Photos.belongsTo(models.User, {
          foreignKey: 'user_id',
          as: 'user'
        });
      }
    }
  });
  return Photos;
};