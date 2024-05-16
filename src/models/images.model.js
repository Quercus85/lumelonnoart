// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const messages = sequelizeClient.define('images', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
        },
        image_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        inserted_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });

    // eslint-disable-next-line no-unused-vars
    /*
    messages.associate = function (models) {
      const foreignKey = {
        name: 'userId',
        allowNull: false,
      };
      messages.belongsTo(models.users, {
        foreignKey,
      });
      models.users.hasMany(messages, {
        foreignKey,
      });
    };
  */
    return messages;
};
