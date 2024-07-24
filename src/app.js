const { createServer } = require('http');
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const services = require('./services');
const session = require('./session');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');
const { connectAndSync, sequelize } = require('./sequelize');

const errorFilePath = path.join(__dirname, './error-page.html');

module.exports.createApp = function createApp() {
  const app = express(feathers());

  // Load app configuration
  app.configure(configuration());
  // Enable security, CORS, compression, favicon and body parsing
  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cors());
  app.use(compress());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //api endpoint services, mostly for easier CRUD operations. NOT FOR PRODUCTION !
  app.get('/api/images', async (req, res) => {
    try {
      const images = await app.service('images').find();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: 'Errore nel recupero delle immagini.: ' + error });
    }
  });

  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await app.service('tags').find();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Errore nel recupero delle tags.: ' + error });
    }
  });


  app.post('/api/imgupload', async (req, res) => {
    try {
      //TODO: trova il tag usando l' id in ingresso. Aggiungi più di un tag
      // Trova il record del tag con ID 1
      const tagRecord = await app.service('tags').find({
        query: {
          id: 1
        }
      });
      console.log("tag trovati: " + JSON.stringify(tagRecord))
      // Crea un nuovo record nella tabella 'images' e associalo al tag trovato
      const insertImg = await app.service('images').create({
        image_name: 'pippolomeo',
        image_url: 'http://iopippo'
      });
      console.log("oggetto immagine restituito: " + JSON.stringify(insertImg))
      console.log("id del tag: " + tagRecord.data[0].id)
      //inserimento del tag ? 
      const pippores = await app.get('sequelizeClient').models.imagestags.create({
        imageId: insertImg.id,
        tagId: tagRecord.data[0].id
      });

      console.log("Cerco di prendere l' immagine con le tag associate");
      const imgTaggate = await app.service('images').find({
        query: {
          $limit:25
        },
        sequelize: {
          include: [{
            model: app.get('sequelizeClient').models.tags,
            as: 'tags',
            through: {
              model: app.get('sequelizeClient').models.imagestags,
              attributes: []
            }
          }]
        }
      });
      
      

      console.log("immagini trovate: " + JSON.stringify(imgTaggate))
      // Invia una risposta di successo
      res.status(200).json({ message: 'Immagine inserita con successo!', data: imgTaggate });
    } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ error: 'Errore durante l\'elaborazione della richiesta.' });
    }
  });

  app.post('/api/addtag', async (req, res) => {
    try {
      const tagToAdd = req.body.description;
      console.log("tag in ingresso: " + tagToAdd)
      if (tagToAdd !== undefined) {
        const addTag = await app.service('tags').create({
          description: tagToAdd
        });
        res.status(200).json({ message: 'Tag inserita con successo!', data: addTag });
      }
      else
        res.status(500).json({ error: 'La descrizione del tag non può essere vuota' });
    }
    catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ error: 'Errore durante l\'elaborazione della richiesta.' });
    }
  })


  /***************/

  app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
  // Host the public folder
  app.use('/', express.static(app.get('public')));

  //redirect for client-side routing
  app.get('/*', function (req, res) {
    res.sendFile(path.join(app.get('public'), 'index.html'));
  });

  const tlsEnabled = app.get('tlsEnabled');
  if (typeof tlsEnabled !== 'boolean') throw new Error('Internal error: tlsEnabled not set');
  if (tlsEnabled) app.set('trust proxy', 1); // trust first proxy

  // Set up Plugins and providers
  app.configure(express.rest());
  app.configure(socketio());
  app.configure(sequelize);
  app.configure(session);

  // Configure other middleware (see `middleware/index.js`)
  app.configure(middleware);
  app.configure(authentication);
  // Set up our services (see `services/index.js`)
  app.configure(services);
  // Set up event channels (see channels.js)
  app.configure(channels);

  // Configure a middleware for the error handler
  //app.use(express.notFound());
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(errorFilePath);
  });
  //middleware for error 404
  app.use(function (req, res, next) {
    res.status(404);
    res.sendFile(errorFilePath);
  });

  app.hooks(appHooks);
  /* //per verificare i servizi attivi
  const serviziAttivi = Object.keys(app.services);
  console.log('Servizi attivi:', serviziAttivi);
  */
  return app;
};

module.exports.startApp = async function startApp(app) {
  const server = createServer(app);
  const port = app.get('port');

  app.setup(server);

  await connectAndSync(app);

  await new Promise((resolve, reject) => {
    let resolved = false;
    server.on('listening', () => {
      resolved = true;
      resolve();
    });
    server.on('error', (err) => {
      logger.error(`App server had an error: ${err.message}`, err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });
    server.listen(port);
  });
  return server;
};
