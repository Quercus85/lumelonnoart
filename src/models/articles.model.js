// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const articles = sequelizeClient.define('articles', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    art_body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  articles.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    articles.belongsToMany(models.tags, {
      foreignKey: 'articleId',
      through: 'articlestags',
      as: 'tags'}
    );
  };

  return articles;
};
