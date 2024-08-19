//const { authenticate } = require('@feathersjs/authentication').hooks;

const includeHook = async context => {
  const app = context.app; // Accedi all'oggetto app dal contesto
  const sequelizeClient = app.get('sequelizeClient');
  const { tags, imagestags } = sequelizeClient.models;

  // Verifica che i modelli siano definiti
  if (!tags || !imagestags) {
    throw new Error('Modelli tags o imagestags non trovati');
  }

  // Aggiungi il campo include alla query
  context.params.sequelize = {
    ...context.params.sequelize,
    include: [{
      model: tags,
      as: 'tags',
      through: {
        model: imagestags,
        attributes: []
      }
    }]
  };

  return context;
};

module.exports = {
  before: {
    all: [],
    find: [includeHook],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
