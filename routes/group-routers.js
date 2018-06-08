
const log = require('../libs/log')(module);
const GroupModel = require('../libs/mongoose').GroupModel;
const passport = require('passport');

module.exports = function (app) {
    app.get('/v0/groups', passport.authenticate('bearer', { session: false }), (req, res) => {
        return GroupModel.find({ created_by: { $nin: [req.user._id] } }, (err, groups) => {
            if(!groups) {
                res.statusCode = 404;
                log.info('no  groups');
                return res.send({ error: 'Not found' });
            };
            if (!err) {
                log.info('send groups');
                return res.send({ status: 'OK', data: groups });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });

    app.get('/v0/user/groups', passport.authenticate('bearer', { session: false }), (req, res) => {
        return GroupModel.find({ created_by: req.user._id}, (err, groups) => {
            if(!groups) {
                res.statusCode = 404;
                log.info('no groups');
                return res.send({ error: 'Not found' });
            };
            if (!err) {
                log.info('send user groups');
                return res.send({ status: 'OK', data: groups });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });

    app.get('/v0/user/groups/:id', function(req, res) {
        return GroupModel.findById(req.params.id, (err, group) => {
            if(!group) {
                res.statusCode = 404;
                log.info('no group');
                return res.send({ error: 'Not found' });
            }
            if (!err) {
                log.info('send group');
                return res.send({ status: 'OK', data: group });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });

    app.post('/v0/user/groups', passport.authenticate('bearer', { session: false }), (req, res) => {
        const group = new GroupModel({
            created_by: req.user.id,
            name: req.body.name,
            description: req.body.description,
            words: req.body.words
        });
        return group.save((err) => {
            if (!err) {
                log.info('Group created');
                return res.send({ status: 'OK', data: group });
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s',res.statusCode, err.message);
            }
        });
    });

    app.put('/V0/user/groups/:id', passport.authenticate('bearer', { session: false }), (req, res) => {
        return GroupModel.findById(req.params.id, (err, group) => {
            if(!group) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }
            if (!req.user._id.equals(group.created_by)) {
                log.error('Not allowed to change group');
                return res.send({ error: 'You have not permission due to are not group\'s creator.' });
            }
            group.name = req.body.name || group.name;
            group.description = req.body.description;
            group.words = req.body.words;
            return group.save((err) => {
                if (!err) {
                    log.info("group updated");
                    return res.send({ status: 'OK', data: group });
                } else {
                    if( err.name === 'ValidationError' ) {
                        res.statusCode = 400;
                        res.send({ error: 'Validation error' });
                    } else {
                        res.statusCode = 500;
                        res.send({ error: 'Server error' });
                    }
                    log.error('Internal error(%d): %s',res.statusCode, err.message);
                }
            });
        });
    });
    app.delete('/V0/user/groups/:id', passport.authenticate('bearer', { session: false }), (req, res) => {
        return GroupModel.findById(req.params.id, (err, group) => {
            if(!group) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }
            if (!req.user._id.equals(group.created_by)) {
                log.error('Not allowed to change group');
                return res.send({ error: 'You have not permission due to are not group\'s creator.' });
            }
            return group.remove(function (err) {
                if (!err) {
                    log.info("group removed");
                    return res.send({ status: 'OK' });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.send({ error: 'Server error' });
                }
            });
        });
    });
};
