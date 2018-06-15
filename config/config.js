require('dotenv').config();
module.exports = {
    port: 3000,
    security: {
        tokenLife: 3600 * 100, //in sec
        resetTokenLife: 3600, //in sec
        confirmTokenLife: 3600, //in sec
        client_id: process.env.CLIENT_ID, //CLIENT_ID
        client_secret: process.env.CLIENT_SECRET // CLIENT_SECRET
    },
    mongoose: {
        url: process.env.MONGODB_URL // MONGODB_URL
    },
    email: {
        password: process.env.SERVICE_EMAIL_PASSWORD, //SERVICE_EMAIL_PASSWORD
        email: process.env.SERVICE_EMAIL_EMAIL,  //SERVICE_EMAIL_EMAIL
        service: 'gmail'
    }
};
