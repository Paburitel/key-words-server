module.exports = function (mongoose) {
    const Word = require('./word')(mongoose);
    const Group = require('./group')(mongoose, Word);
    const User = require('./user')(mongoose);
    const Client = require('./client')(mongoose);
    const AccessToken = require('./access-token')(mongoose);
    const RefreshToken = require('./refresh-token')(mongoose);
    const ResetToken = require('./reset-token')(mongoose);
    return {
        Word: Word,
        Group: Group,
        User: User,
        Client: Client,
        AccessToken: AccessToken,
        RefreshToken: RefreshToken,
        ResetToken: ResetToken
    }
};
