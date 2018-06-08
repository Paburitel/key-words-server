const config                  = require('../config/config');
const passport                = require('passport');
const BasicStrategy           = require('passport-http').BasicStrategy;
const ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
const BearerStrategy          = require('passport-http-bearer').Strategy;
const UserModel               = require('./mongoose').UserModel;
const ClientModel             = require('./mongoose').ClientModel;
const AccessTokenModel        = require('./mongoose').AccessTokenModel;
const RefreshTokenModel       = require('./mongoose').RefreshTokenModel;
const log = require('../libs/log')(module);

passport.use(new BasicStrategy(
    (username, password, done) => {
        ClientModel.findOne({ clientId: username }, (err, client) => {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret !== password) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    (clientId, clientSecret, done) => {
        ClientModel.findOne({ clientId: clientId }, (err, client) => {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret !== clientSecret) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    (accessToken, done) => {
        AccessTokenModel.findOne({ token: accessToken }, (err, token) => {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }
            if( Math.round((Date.now()- token.created) / 1000) > config.security.tokenLife ) {
                AccessTokenModel.remove({ token: accessToken }, (err) => {
                    if (err) return done(err);
                });
                return done(null, false, { message: 'Token expired' });
            }
            UserModel.findById(token.userId, (err, user) => {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user' }); }

                const info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));
