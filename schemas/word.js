
module.exports = function (mongoose) {
    const Schema = mongoose.Schema;

    return new Schema({
        text: { type: String, required: true },
        checked: { type: Boolean, required: false }
    });
};
