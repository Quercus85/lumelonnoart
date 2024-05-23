// Initializes the `messages` service on path `/messages`
const { Images } = require('./images.class');
const createModel = require('../../models/images.model');
const hooks = require('./images.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/images', new Images(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('images');

  service.hooks(hooks);
};
