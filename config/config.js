module.exports = {
    port: 3000,
    security: {
        tokenLife: 3600 * 100, //in sec
        resetTokenLife: 3600, //in sec
        confirmTokenLife: 3600, //in sec
        client_id: '665935136173-43gdh0vlhohvh21p3u3dv7p0j1i49an7.apps.googleusercontent.com',
        client_secret: 'noCbeZe7A6y-vXoesqtlt4m1'
    },
    mongoose: {
        url: 'mongodb://Paburitel:kw1996@ds263759.mlab.com:63759/key-words'
    },
    email: {
        password: 'passwordForServices',
        email: 'nikappservices@gmail.com',
        service: 'gmail'
    }
};
