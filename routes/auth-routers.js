const oauth2 = require('../libs/oauth2');
const passport = require('passport');
const UserModel = require('../libs/mongoose').UserModel;
const AccessTokenModel = require('../libs/mongoose').AccessTokenModel;
const RefreshTokenModel = require('../libs/mongoose').RefreshTokenModel;
const ResetTokenModel = require('../libs/mongoose').ResetTokenModel;
const log = require('../libs/log')(module);
const config = require('../config/config');
const async = require('async');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.email,
        pass: config.email.password
    }
});

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

    app.post('/api/forgot', (req, res) => {
        const email = req.body.email;
        return async.waterfall([
           (done) => {
               crypto.randomBytes(20, function(err, buf) {
                    const resetTokenValue = buf.toString('base64');
                    done(err, resetTokenValue);
                });
            },
            (resetTokenValue, done) => {
                UserModel.findOne({ email: email }, (err, user) => {
                        if (!user) {
                            res.statusCode = 404;
                            log.info('Not found user');
                            return res.send({error: 'Not found'});
                        }
                        if (err) {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s', res.statusCode, err.message);
                            return res.send({error: 'Server error'});
                        }
                        const resetToken = new ResetTokenModel({
                            userId: user.userId,
                            token: resetTokenValue
                        });
                        resetToken.save((err) => {
                            if (err) {
                                res.statusCode = 500;
                                log.error('Internal error(%d): %s', res.statusCode, err.message);
                                return res.send({error: 'Server error'});
                            }
                            log.info('after save', resetToken.token);
                            done(err, resetTokenValue);
                        });
                    });
                }, (resetTokenValue) => {
                    const mailOptions = {
                        from: config.email.email,
                        to: email,
                        subject: 'Key Words Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account in "Key Words".\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.origin + '/reset?token=' + encodeURIComponent(resetTokenValue) + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode, err.message);
                            return res.send({ error: 'Server error' });
                        } else {
                            log.info('Email sent: ' + info.response);
                            return res.send({ status: 'OK', emailSent: !error });
                        }
                    });
                }

        ], (err) => {
            if (err) {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });

    });

    app.post('/api/reset', (req, res) => {
        const resetTokenValue = req.body.token;
        const newPassword = req.body.password;
        return async.waterfall([
                (done) => {

                    ResetTokenModel.findOne({ token: resetTokenValue }, (err, token) => {
                        if (err) {
                            log.info('Error find token');
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s', res.statusCode, err.message);
                            return res.send({error: 'Server error'});
                        }
                        if (!token) {
                            res.statusCode = 404;
                            log.info('no reset token');
                            return res.send({ errors: [{"errorType":"invalid_grant", "message":"Refresh token invalid"}],"success":false})
                        }
                        done(err, token);
                    });
                }, (resetToken, done) => {
                    if ( ((Date.now() - resetToken.created ) / 1000) > config.security.resetTokenLife ) {
                        res.statusCode = 401;
                        log.info('Token expired');
                        return res.send({ errors: [{"errorType":"invalid_grant", "message":"Refresh token expired"}],"success":false});
                    }
                    UserModel.findById(resetToken.userId, (err, user) => {
                        if (err) {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s', res.statusCode, err.message);
                            return res.send({error: 'Server error'});
                        }
                        if (!user) {
                            res.statusCode = 404;
                            return res.send({ error: 'User Not found' });
                        }
                        done(err, user);
                    })
                }, (user, done) => {
                    user.password = newPassword;
                    user.save( (err) => {
                        if (err) {
                            if( err.name === 'ValidationError' ) {
                                res.statusCode = 400;
                                return res.send({ error: 'Validation error' });
                            } else {
                                res.statusCode = 500;
                                return res.send({ error: 'Server error' });
                            }
                        } else {
                            ResetTokenModel.remove({ userId: user.userId, token: resetTokenValue }, (err) => {
                                if (err) log.error('Internal error(%d): %s', res.statusCode, err.message);
                            });
                            done(err, user);
                        }
                    })
                }, (user) => {
                    const mailOptions = {
                        from: config.email.email,
                        to: user.email,
                        subject: 'Key Words Password Reset',
                        text: 'Dear ' + user.username + '!\n\n'+'Your password has been successful reset, you can now login with your new password.\n\n' + 'Cheers!.\n'
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            log.error('Internal error(%d): %s',res.statusCode, err.message);
                        } else {
                            log.info('Email sent: ' + info.response);
                        }
                        return res.send({ status: 'OK', emailSent: !error, changed: true});
                    });
                }
            ],
            (err) => {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            });
    })
};
