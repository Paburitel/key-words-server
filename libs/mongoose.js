const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
const log = require('./log')(module);
const dbConfig = require('../config/config').mongoose;
const schemas = require('../schemas/index')(mongoose);
mongoose.connect(dbConfig.url);
const db = mongoose.connection;
db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

module.exports.GroupModel = mongoose.model('Group', schemas.Group);
module.exports.UserModel = mongoose.model('User', schemas.User);
module.exports.ClientModel = mongoose.model('Client', schemas.Client);
module.exports.AccessTokenModel = mongoose.model('AccessToken', schemas.AccessToken);
module.exports.RefreshTokenModel = mongoose.model('RefreshTokenModel', schemas.RefreshToken);
