// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
//const { ImagesTags } = require('./images-tags.model');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const tags = sequelizeClient.define('tags', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    },
  });

  // eslint-disable-next-line no-unused-vars
  tags.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    tags.belongsToMany(models.images, 
      {
      foreignKey: 'tagId',
      through: 'imagestags',
      as: 'images'
      });
  };

  return tags;
};
