
const logCreate = () => {
  return (context) => {
    console.log('Nuovo record creato:', context.data);
    return context;
  };
};

const log = () => {
  return (context) => {
    //console.log("E' almeno partito il servizio ?");
    return context;
  };
};

module.exports = {
  before: {
    all: [log()],
    find: [],
    get: [],
    create: [logCreate()],
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
