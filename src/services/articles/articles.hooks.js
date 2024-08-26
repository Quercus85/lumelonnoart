const includeTagsHook = async context => {
  const app = context.app; // Accedi all'oggetto app dal contesto
  const sequelizeClient = app.get('sequelizeClient');
  const { tags, articlestags } = sequelizeClient.models;

  // Verifica che i modelli siano definiti
  if (!tags || !articlestags) {
    throw new Error('Modelli tags o imagestags non trovati');
  }

  // Aggiungi il campo include alla query
  context.params.sequelize = {
    ...context.params.sequelize,
    include: [{
      model: tags,
      as: 'tags',
      attributes:['description'],
      through: {
        model: articlestags,
        attributes: []
      }
    }],
    limit: 25, // Imposta il limite di risultati a 25
    offset: context.params.query.$skip || 0
  };

  return context;
};

module.exports = {
  before: {
    all: [],
    find: [includeTagsHook],
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
