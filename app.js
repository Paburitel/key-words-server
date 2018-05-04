/**
 * Created by Paburitel on 30.04.2018.
 */
const express = require('express');
const morgan = require('morgan');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

const favicon = require('serve-favicon');
const path = require('path');

const log = require('./libs/log')(module);

const OAuth2Server = require('oauth2-server');

const config = require('./config/config');

const routes = require('./routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(express.static(path.join(__dirname, "dist")));

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));


//-------------------------------AUTH---------------------------------
let oauth = new OAuth2Server({
    model: require('./models/auth.model'),
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 10 * 60 * 60
});

//---------------------------------------------------------------
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:4200'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.header('Access-Control-Allow-Origin', origin);
    }
    return next();
});
app.options('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});
routes(app);

/** Error catching */

app.use(function(req, res){
    res.status(404);
    log.debug('Not found URL: %s', req.url);
    res.send({ error: 'Not found' });
});

app.use(function(err, req, res){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s', res.statusCode, err.message);
    res.send({ error: err.message });
});
/** -------------------------------------------- */

app.listen(config.port, function () {
    log.info('Express server listening on port 3000!!!');
});

module.exports.app = app;
