const ClientModel = require('../libs/mongoose').ClientModel;
const log = require('../libs/log')(module);
module.exports = function () {
    ClientModel.remove({}, function(err) {
        var client = new ClientModel({ name: "key-words-web", clientId: "665935136173-43gdh0vlhohvh21p3u3dv7p0j1i49an7.apps.googleusercontent.com", clientSecret:"noCbeZe7A6y-vXoesqtlt4m1" });
        client.save(function(err, client) {
            if(err) return log.error(err);
            else log.info("New client - %s:%s",client.clientId,client.clientSecret);
        });
    });
}
