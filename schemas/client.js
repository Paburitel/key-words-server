
module.exports = function (mongoose) {
    const Schema = mongoose.Schema;
    // User
    const Client = new Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        clientId: {
            type: String,
            unique: true,
            required: true
        },
        clientSecret: {
            type: String,
            required: true
        }
    });

    return Client;
};
