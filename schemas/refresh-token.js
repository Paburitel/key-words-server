
module.exports = function (mongoose) {
    const Schema = mongoose.Schema;
    // RefreshToken
    const RefreshToken = new Schema({
        userId: {
            type: String,
            required: true
        },
        clientId: {
            type: String,
            required: true
        },
        token: {
            type: String,
            unique: true,
            required: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    });
    return RefreshToken;
};
