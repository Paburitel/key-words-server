module.exports = function (mongoose) {
    const Schema = mongoose.Schema;
    // RefreshToken
    const ResetToken = new Schema({
        userId: {
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
    return ResetToken;
};
