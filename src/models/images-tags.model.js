// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const imagesTags = sequelizeClient.define('images_tags', {
    
    images_id:{
      type: DataTypes.BIGINT,
      references :{
        model: 'images',
        key: 'id'
      }
    },
    tags_id:{
      type: DataTypes.BIGINT,
      references :{
        model: 'tags',
        key: 'id'
      }
    }
      
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  imagesTags.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return imagesTags;
};
