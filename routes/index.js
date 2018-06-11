const groupRoutes  = require('./group-routers');
const authRoutes  = require('./auth-routers');

module.exports = function (app) {
    groupRoutes(app);
    authRoutes(app);
}
