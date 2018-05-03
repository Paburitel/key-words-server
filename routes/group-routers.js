
const log = require('../libs/log')(module);
const GroupModel = require('../libs/mongoose').GroupModel;

module.exports = function (app) {
    app.get('/v0/groups', (req, res) => {
        return GroupModel.find((err, groups) => {
            if (!err) {
                log.info('send groups');
                return res.send(groups);
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });

    app.get('/v0/groups/:id', function(req, res) {
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

    app.post('/v0/groups', (req, res) => {
        const group = new GroupModel({
            name: req.body.name,
            description: req.body.description,
            words: req.body.words
        });
        return group.save((err) => {
            if (!err) {
                log.info('Group created');
                return res.send({ status: 'OK', data: group });
            } else {
                log.error('Internal error(%d): %s',res.statusCode, err.message);
            }
        });
    });
    app.put('/V0/groups/:id', (req, res) => {
        const data = {
            name: req.body.name,
            age: req.body.description
        };
        return GroupModel.findByIdAndUpdate(req.params.id, data, {new: true}, (err, group) => {
            if (!err) {
                log.info("group updated");
                return res.send({ status: 'OK', data: group });
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Name Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s',res.statusCode, err.message);
            }

        });
    });
    app.delete('/V0/groups/:id', (req, res) => {
        return GroupModel.findById(req.params.id, (err, group) => {
            if(!group) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
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
