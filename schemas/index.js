module.exports = function (mongoose) {
    const Word = require('./word')(mongoose);
    const Group = require('./group')(mongoose, Word);
    return {
        Word: Word,
        Group: Group
    }
};
