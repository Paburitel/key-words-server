const oauth2 = require('../libs/oauth2');
const passport = require('passport');
const UserModel = require('../libs/mongoose').UserModel;
const ClientModel         = require('../libs/mongoose').ClientModel;
const AccessTokenModel    = require('../libs/mongoose').AccessTokenModel;
const RefreshTokenModel   = require('../libs/mongoose').RefreshTokenModel;
const log = require('../libs/log')(module);
const config = require('../config/config');

module.exports = function (app) {
    app.post('/api/oauth/reg', (req, res) => {
        const data = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        };
        const user = new UserModel(data);
        user.save(function(err, user) {
            if (err) {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode, err.message);
                return res.send({ error: err.message });
            } else {
                log.info("New user - %s:%s", user.username, user.password, user.email);
                return res.send({ status: 'OK'});
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
            res.json({ user_id: req.user.userId, name: req.user.username, email: req.user.email,  scope: req.authInfo.scope })
        }
    );
    app.delete('/api/signout', passport.authenticate('bearer', { session: false }),
        (req, res) => {
            log.info('logout');
            const accessToken = req.headers.authorization.split(' ')[1];
            AccessTokenModel.findOne({ token: accessToken }, (err, token) => {
                if (err) {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({ error: 'Server error' });
                }
                if (!token) {
                    res.statusCode = 404;
                    log.info('token not found');
                    return res.send({ error: 'Not found' });
                } else {
                    AccessTokenModel.remove({ token: accessToken,  },  (err) => {
                        if (err) {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            return res.send({ error: 'Server error' });
                        } else {
                            return res.send({ status: 'OK' });
                        }
                    });
                    RefreshTokenModel.remove({ userId: token.userId, clientId: token.clientId }, function (err) {
                        if (err) log.error('Internal error(%d): %s', res.statusCode, err.message);
                    });
                }
            });
        });
};
