const oauth2 = require('../libs/oauth2');
const passport = require('passport');
const UserModel = require('../libs/mongoose').UserModel;
const log = require('../libs/log')(module);

module.exports = function (app) {
    app.post('/api/oauth/reg', (req, res) => {
        const data = {
            username: req.body.username,
            password: req.body.password
        };
        log.info(req.body.username);
        const user = new UserModel(data);
        user.save(function(err, user) {
            if (err) {
                return log.error(err);
            } else {
                log.info("New user - %s:%s",user.username,user.password);
            }
        });
    });
    app.post('/api/oauth/token', oauth2.token);

    app.get('/api/userInfo',
        passport.authenticate('bearer', { session: false }),
        (req, res) => {
            // req.authInfo is set using the `info` argument supplied by
            // `BearerStrategy`.  It is typically used to indicate scope of the token,
            // and used in access control checks.  For illustrative purposes, this
            // example simply returns the scope in the response.
            res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope })
        }
    );
};
