
module.exports = function (mongoose, Word) {
    const Schema = mongoose.Schema;
    const Group = new Schema({
        name: { type: String, required: true },
        description: { type: String, required: false },
        words: { type: [Word], required: false },
        updated_at : { type: Date, default: Date.now },
        created_at: { type: Date, default: Date.now },
        created_by: { type: Schema.Types.ObjectId, required: true },
    });
    Group.path('name').validate(function (v) {
        return v.length > 1 && v.length < 15;
    });

    Group.pre('save', function(next) {
        this.updated_at = Date.now();
        next();
    });

    return Group;
};
