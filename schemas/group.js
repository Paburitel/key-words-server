
module.exports = function (mongoose, Word) {
    const Schema = mongoose.Schema;
    const Group = new Schema({
        name: { type: String, required: true },
        description: { type: String, required: false },
        words: { type: [Word], required: false },
        modified: { type: Date, default: Date.now }
    });
    Group.path('name').validate(function (v) {
        return v.length > 1 && v.length < 15;
    });

    return Group;
};
