const users = require('./users/users.service.js');
const messages = require('./messages/messages.service.js');
const images = require('./images/images.service.js');
const tags = require('./tags/tags.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(messages);
  app.configure(images);
  app.configure(tags);
};
