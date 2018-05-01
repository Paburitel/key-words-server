const noteRoutes  = require('./note-routers');

module.exports = function (app, db) {
    noteRoutes(app, db);
}
