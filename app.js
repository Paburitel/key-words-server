/**
 * Created by Paburitel on 30.04.2018.
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('./config/db');
const favicon = require('serve-favicon');
const path = require('path');

const PORT = 3000;

const routes = require('./server/routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(express.static(__dirname + '/dist'));

app.use(function(req, res, next) {
    const allowedOrigins = ['http://localhost:4200'];
    const origin = req.headers.origin;
    console.log(origin);
    if(allowedOrigins.indexOf(origin) > -1){
        console.log('Allow');
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

MongoClient.connect(dbConfig.url, (err, db) => {
    if (err) {
        return console.log(err, "Mongo ERR");

    }
    const DB = db.db('key-words');
    routes(app, DB);
    app.listen(PORT, function () {
        console.log('listening on port 3000!!!');
    });
})

