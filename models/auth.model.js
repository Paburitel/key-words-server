
module.exports = {
    getAccessToken: function() {
        return new Promise('works!');
    },
    grantTypeAllowed : function(done) {
        done(null, 'works!');
    },
    getClient: function*() {
        return new Promise('works!');
    },
    getUser: function() {
        return new Promise('works!');
    }
};
