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
const tagsFormatter = require("./utils/tags-json-formatter-for-api");
const randomIdGenerator = require("./utils/random-id-generator");

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

  //api endpoint services. NOT FOR PRODUCTION !
  app.get('/api/images', async (req, res) => {
    try {
      const imgTaggate = await app.service('images').find({
        query: {
          isGallery: true,
          $skip: 0
        }
      });
      const jsonOutput = tagsFormatter(imgTaggate);
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

  app.get('/api/articles', async (req, res) => {
    try {
      // Recupera gli articoli
      const articles = await app.service('articles').find({
        query: {
          $skip: 0
        }
      });

      // Recupera le immagini utilizzando image_id dagli articoli
      const imageIds = articles.data
        .filter(article => article.image_id !== null)
        .map(article => article.image_id);
      const images = await app.service('images').find({
        query: {
          article_id: {
            $in: imageIds
          }
        }
      });

      // Formatta i dati degli articoli e aggiungi le immagini corrispondenti
      const jsonOutput = tagsFormatter(articles);
      /*
      jsonOutput.forEach(article => {
        article.images = images.data.filter(image => image.id === article.image_id);
      });
      */
      jsonOutput.forEach(article => {
        article.images = images.data.filter(image => image.article_id === article.image_id);
      });

      res.status(200).json(jsonOutput);
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
      const imgToUpload = req.body.images;

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
        // Crea un nuovo record nella tabella 'images'
        const insertImg = await app.service('images').create({
          image_name: imgToUpload[image].image_name,
          image_url: imgToUpload[image].image_url,
          image_thumb: imgToUpload[image].image_thumb
        });
        //associa l' immagine ai tags in relazione m:n

        for (tag in tagList) {
          const tagsId = tagList[tag].data[0].id;
          //const tagsId = tagList[tag].data[0];
          //await insertImg.addTags(tagsId);
          const createAssociation = await app.get('sequelizeClient').models.imagestags.create({
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
      if (tagToAdd !== undefined) {
        for (i in tagToAdd) {
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
  });

  app.post('/api/articleupload', async (req, res) => {
    try {
      // Trova il record del tag con ID 1
      const articleToUpload = req.body.articles;

      for (article in articleToUpload) {
        //recupera gli oggetti 'tags'. In teoria ho già gli id, ma assicura di non inserire associazioni con tag id inesistenti,
        let tagList = [];
        let articleProg;
        const tagsToFind = articleToUpload[article].tags;
        for (tag in tagsToFind) {
          const tagObject = await app.service('tags').find({
            query: {
              id: tagsToFind[tag].id
            }
          });
          tagList.push(tagObject);
        }
        // Crea un nuovo record nella tabella 'images'
        //controlla se related_images è valorizzato. Se lo è, crea un id random e lo setta in tabella. Poi deve inserire in images i dati delle immagini insieme all' id
        if (articleToUpload[article].related_images != undefined && articleToUpload[article].related_images.length > 0) {
          while (true) {
            const articleId = randomIdGenerator();
            const checkArticle = await app.service('articles').find({
              query: {
                $skip: 0,
                image_id: articleId
              }
            });
            if (checkArticle.data == undefined || checkArticle.data == null || checkArticle.data.length == 0) {
              const insertArticle = await app.service('articles').create({
                title: articleToUpload[article].title,
                subtitle: articleToUpload[article].subtitle,
                art_body: articleToUpload[article].art_body,
                image_id: articleId
              });
              articleProg = insertArticle.id;

              for (imgToUpload in articleToUpload[article].related_images) {
                const insertImage = await app.service('images').create({
                  image_name: articleToUpload[article].related_images[imgToUpload].image_name,
                  image_url: articleToUpload[article].related_images[imgToUpload].image_url,
                  image_thumb: articleToUpload[article].related_images[imgToUpload].image_thumb,
                  article_id: articleId
                });
              }
              break;
            }
          }
        }
        else {
          const insertArticle = await app.service('articles').create({
            title: articleToUpload[article].title,
            subtitle: articleToUpload[article].subtitle,
            art_body: articleToUpload[article].art_body
          });
          articleProg = insertArticle.id;
        }
        //associa l' immagine ai tags in relazione m:n

        for (tag in tagList) {
          const tagsId = tagList[tag].data[0].id;
          //const tagsId = tagList[tag].data[0];
          //await insertImg.addTags(tagsId);
          const createAssociation = await app.get('sequelizeClient').models.articlestags.create({
            articleId: articleProg,
            tagId: tagsId
          });
        }
      }
      // Invia una risposta di successo
      res.status(200).json({ message: 'Articoli inseriti con successo!' });
    } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({
        error: 'Errore durante l\'elaborazione della richiesta. Code: ' + error.code + " / name: " + error.name +
          " / message: " + error.message
      });
    }
  });




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
