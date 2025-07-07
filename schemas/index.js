export default function (mongoose) {
    const Word = require('./word.js')(mongoose);
    const Group = require('./group.js')(mongoose, Word);
    const User = require('./user.js')(mongoose);
    const Client = require('./client.js')(mongoose);
    const AccessToken = require('./access-token.js')(mongoose);
    const RefreshToken = require('./refresh-token.js')(mongoose);
    const ResetToken = require('./reset-token.js')(mongoose);
    return {
        Word: Word,
        Group: Group,
        User: User,
        Client: Client,
        AccessToken: AccessToken,
        RefreshToken: RefreshToken,
        ResetToken: ResetToken
    }
}
