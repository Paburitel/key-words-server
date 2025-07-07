import mongoose from 'mongoose';
import logModule from './log.js';
import configModule from '../config/config.js';
import schemasModule from '../schemas/index.js';

const log = logModule;
const dbConfig = configModule.mongoose;
const schemas = schemasModule(mongoose);
mongoose.connect(dbConfig.url);
const db = mongoose.connection;
db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

const GroupModel = mongoose.model('Group', schemas.Group);
const UserModel = mongoose.model('User', schemas.User);
const ClientModel = mongoose.model('Client', schemas.Client);
const AccessTokenModel = mongoose.model('AccessToken', schemas.AccessToken);
const RefreshTokenModel = mongoose.model('RefreshTokenModel', schemas.RefreshToken);
const ResetTokenModel = mongoose.model('ResetTokenModel', schemas.ResetToken);

export { GroupModel, UserModel, ClientModel, AccessTokenModel, RefreshTokenModel, ResetTokenModel };
