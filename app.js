/**
 * Created by Paburitel on 30.04.2018.
 */

import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import bodyParser from 'body-parser';
// use for new client
// import makeClient from './helpers/makeClient.js';
import favicon from 'serve-favicon';
import path from 'path';
import logModule from './libs/log.js';
import passport from 'passport';
import config from './config/config.js';
import routes from './routes/index.js';
import './libs/oauth.js';

const app = express();
const PORT = process.env.PORT || config.port;

app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(path.dirname(new URL(import.meta.url).pathname), 'access.log'), {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//---------------------------------------------------------------
/** Send static files */
app.use(favicon(path.join(path.dirname(new URL(import.meta.url).pathname), 'dist', 'favicon.ico')));
app.use(express.static(path.join(path.dirname(new URL(import.meta.url).pathname), "dist")));

/** Set options */
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:4200'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.header('Access-Control-Allow-Origin', origin);
    }
    return next();
});
app.options('/*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, application/x-www-form-urlencoded');
    res.sendStatus(200);
});

/** Start routing */
routes(app);

/** Send all other requests to the Angular app */
app.get('*', (req, res) => {
    res.sendFile(path.join(path.dirname(new URL(import.meta.url).pathname), 'dist/index.html'));
});

/** Error catching */
app.use((req, res, next) => {
    res.status(404);
    log.debug('Not found URL: %s', req.url);
    res.send({ error: 'Not found' });
    return next();
});

app.use((err, req, res, next) => {
    log.error('500 Handler');
    res.status(err.status || 500);
    log.error('Internal error(%d): %s', res.statusCode, err.message);
    res.send({ error: err.message });
    return next();
});
/** -------------------------------------------- */
app.listen(PORT, () => {
    log.info('Express server listening on port ' + PORT + '!!!');
});

export { app };
