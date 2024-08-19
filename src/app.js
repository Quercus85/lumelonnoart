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

function tagsOfImagesJsonFormatter(imgTaggate) {
  console.log("tagsOfImagesJsonFormatter START");
  const tagsById = {};

  // Itera attraverso i dati e raggruppa i tag per ID
  if (imgTaggate != undefined) {
    imgTaggate.data.forEach(image => {
      const { id, 'tags.id': tagsId, 'tags.description': tagsDescription } = image;
      if (!tagsById[id]) {
        tagsById[id] = [];
      }
      tagsById[id].push(tagsId);
      tagsById[id].push(tagsDescription);
    });

    // Crea un nuovo array con i tag raggruppati
    const aggregatedTags = Object.keys(tagsById).map(id => ({
      id,
      tags: tagsById[id]
    }));

    console.log("aggregatedTags: " + JSON.stringify(aggregatedTags));

    //modifica del json in uscita
    for (var i = 0; i < imgTaggate.data.length; i++) {
      if (imgTaggate.data[i - 1] != undefined && imgTaggate.data[i - 1].id === imgTaggate.data[i].id) {
        //console.log("imgTaggate ha l' array tags. Skip");
        continue;
      }
      else {
        /*cicla l' oggetto. Cerca in aggregatedTags l' id corrispondente e gli aggiunge l' arrai con le sue tag. 
        Possibilmente, elimina i campi non necessari da esporre
        */
        let tagsArray;
        for (var t = 0; t < aggregatedTags.length; t++) {
          if (aggregatedTags[t].id === imgTaggate.data[i].id) {
            tagsArray = aggregatedTags[t].tags;
            break;
          } //else console.log("skip")
        }
        //
        //aggiungo l' array delle tag al json in uscita. Elimino le voci non necessarie
        console.log("aggiungo l' array delle tag al json in uscita");
        imgTaggate.data[i].tags = tagsArray;
        console.log("Elimino le voci non necessarie")
        delete imgTaggate.data[i]['tags.id'];
        delete imgTaggate.data[i]['tags.description'];
        delete imgTaggate.data[i]['tags.createdAt'];
        delete imgTaggate.data[i]['tags.updatedAt'];
      }
    }
    //filtro i dati con immagine id duplicata che non hanno l' array delle tag
    console.log("tagsOfImagesJsonFormatter END");
    return imgTaggate.data = imgTaggate.data.filter(item => item.hasOwnProperty('tags'));
  }
  else return imgTaggate;
}

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
      const imgTaggate = await app.service('images').find({
        query: {
          $limit: 25
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
      const jsonOutput = tagsOfImagesJsonFormatter(imgTaggate);
      res.status(200).json(jsonOutput);
    } catch (error) {
      res.status(500).json({
        error: 'Errore durante l\'elaborazione della richiesta. Code: ' + error.code + " / name: " + error.name +
          " / message: " + error.message
      });
    }
  });

  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await app.service('tags').find();
      res.json(tags);
    } catch (error) {
      res.status(500).json({
        error: 'Errore durante l\'elaborazione della richiesta. Code: ' + error.code + " / name: " + error.name +
          " / message: " + error.message
      });
    }
  });


  app.post('/api/imgupload', async (req, res) => {
    try {
      // Trova il record del tag con ID 1
      console.log("json in ingresso: " + JSON.stringify(req.body));
      const imgToUpload = req.body.images;
      console.log("imgToUpload: " + JSON.stringify(imgToUpload));

      for (image in imgToUpload) {
        //recupera gli oggetti 'tags'. In teoria ho già gli id, ma assicura di non inserire associazioni con tag id inesistenti,
        let tagList = [];
        const tagsToFind = imgToUpload[image].tags;
        for (tag in tagsToFind) {
          const tagObject = await app.service('tags').find({
            query: {
              id: tagsToFind[tag].id
            }
          });
          tagList.push(tagObject);
        }
        console.log("tag trovati: " + JSON.stringify(tagList));
        // Crea un nuovo record nella tabella 'images'
        const insertImg = await app.service('images').create({
          image_name: imgToUpload[image].image_name,
          image_url: imgToUpload[image].image_url,
          image_thumb: imgToUpload[image].image_thumb
        });
        //console.log("oggetto immagine restituito: " + JSON.stringify(insertImg))
        //associa l' immagine ai tags in relazione m:n

        for (tag in tagList) {
          const tagsId = tagList[tag].data[0].id;
          //const tagsId = tagList[tag].data[0];
          //await insertImg.addTags(tagsId);
          console.log("Inserimento associazione: imageId " + insertImg.id + " // tagId: " + tagsId);
          const pippores = await app.get('sequelizeClient').models.imagestags.create({
            imageId: insertImg.id,
            tagId: tagsId
          });
        }
      }
      // Invia una risposta di successo
      res.status(200).json({ message: 'Immagini inserite con successo!' });
    } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({
        error: 'Errore durante l\'elaborazione della richiesta. Code: ' + error.code + " / name: " + error.name +
          " / message: " + error.message
      });
    }
  });

  app.post('/api/addtag', async (req, res) => {
    try {
      const tagToAdd = req.body.tags;
      console.log("tag in ingresso: " + JSON.stringify(tagToAdd))
      if (tagToAdd !== undefined) {
        for (i in tagToAdd) {
          console.log("Inserimento del tag: " + tagToAdd[i].description);
          const addTag = await app.service('tags').create({
            description: tagToAdd[i].description
          });
        }
        res.status(200).json({ message: 'Tag inserite con successo!' });
      }
      else
        res.status(500).json({ error: 'La descrizione del tag non può essere vuota' });
    }
    catch (error) {
      console.error("Errore:", error);
      res.status(500).json({
        error: 'Errore durante l\'elaborazione della richiesta. Code: ' + error.code + " / name: " + error.name +
          " / message: " + error.message
      });
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
