// Initializes the `ImagesTags` service on path `/imagesTags`
const { ImagesTags } = require('./images-tags.class');
const createModel = require('../../models/images-tags.model');
const hooks = require('./images-tags.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/imagesTags', new ImagesTags(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('imagesTags');

  service.hooks(hooks);
};
