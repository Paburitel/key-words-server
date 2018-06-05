const crypto = require('crypto');

module.exports = function (mongoose) {
    const Schema = mongoose.Schema;
    // User
    const User = new Schema({
        username: {
            type: String,
            unique: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        hashedPassword: {
            type: String,
            required: true
        },
        salt: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    });

    User.methods.encryptPassword = function(password) {
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
    };

    User.virtual('userId')
        .get(function () {
            return this.id;
        });

    User.virtual('password')
        .set(function(password) {
            this.salt = crypto.randomBytes(32).toString('base64');
            //more secure - this.salt = crypto.randomBytes(128).toString('base64');
            this.hashedPassword = this.encryptPassword(password);
        })
        .get(function() { return this.hashedPassword; });


    User.methods.checkPassword = function(password) {
        return this.encryptPassword(password) === this.hashedPassword;
    };

    User.path('email').validate(function (email) {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(email);
    }, 'The email field should be correct.');

    User.path('username').validate(function (v) {
        return v.length > 1 && v.length < 15;
    });

    return User;
};
