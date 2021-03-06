const oauth2orize         = require('oauth2orize');
const passport            = require('passport');
const crypto              = require('crypto');
const config              = require('../config/config');
const UserModel           = require('./mongoose').UserModel;
const AccessTokenModel    = require('./mongoose').AccessTokenModel;
const RefreshTokenModel   = require('./mongoose').RefreshTokenModel;
const log = require('../libs/log')(module);

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    UserModel.findOne({ username: username }, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.checkPassword(password)) { return done(null, false); }
        RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
            if (err) return done(err);
        });
        AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
            if (err) return done(err);
        });

        const tokenValue = crypto.randomBytes(32).toString('hex');
        const refreshTokenValue = crypto.randomBytes(32).toString('hex');
        const token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        const refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        refreshToken.save(function (err) {
            if (err) { return done(err); }
        });
        const info = { scope: '*' }
        token.save(function (err) {
            if (err) { return done(err); }
            done(null, tokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife });
        });
    });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    RefreshTokenModel.findOne({ token: refreshToken }, (err, token) => {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        if (!token) { return done(null, false); }

        UserModel.findById(token.userId, (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
                if (err) return done(err);
            });
            AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId },  (err) => {
                if (err) return done(err);
            });
            const tokenValue = crypto.randomBytes(32).toString('hex');
            const refreshTokenValue = crypto.randomBytes(32).toString('hex');
            const token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
            const refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
            refreshToken.save((err) => {
                if (err) { return done(err); }
            });
            const info = { scope: '*' }
            token.save((err) => {
                if (err) { return done(err); }
                done(null, tokenValue, refreshTokenValue, { 'expires_in':  config.security.tokenLife });
            });
        });
    });
}));

// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];
