const groupRoutes  = require('./group-routers');

module.exports = function (app) {
    groupRoutes(app);
}
