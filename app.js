/**
 * Created by Paburitel on 30.04.2018.
 */
const express = require('express');
const morgan = require('morgan');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
// use for new client
// const makeClient = require('./helpers/makeClient')();

const favicon = require('serve-favicon');
const path = require('path');

const log = require('./libs/log')(module);

const passport = require('passport');

const config = require('./config/config');

const routes = require('./routes/index');
const PORT = process.env.PORT || config.port;

app.use(passport.initialize());

require('./libs/oauth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(express.static('/*', path.join(__dirname, "dist")));

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//---------------------------------------------------------------
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

module.exports.app = app;
