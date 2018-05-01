const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
    app.get('/v0/groups', (req, res) => {
        console.log("GET GROUPS");
        db.collection('groups').find().toArray(function(err, results){
            if (err) {
                console.log('Err', err);
            }
            console.log("groups", results);
            res.send(results);
        });
    });

    app.post('/v0/groups', (req, res) => {
        console.log("POST");
        console.log(req.body);
        const event = {

        };
        console.log(event);
        db.collection('groups').insert(event, (err, result) => {
            if (err) {
                console.log("ADD ERROR");
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log("ADD done");
                res.send(result.ops[0]);
            }
        });
    });
    app.delete('/V0/groups', (req, res) => {
        const id = req.body;
        const multiID = id.map(id =>  new ObjectID(id));
        db.collection('groups').remove({'_id': {$in: multiID}}, (err, item) => {
            if (err) {
                console.log("DELETE ERROR");
                res.send({'error':'An error has occurred'});
            } else {
                console.log("DELETE done");
                res.send('Event ' + id + ' deleted!');
            }
        });
    });

};
