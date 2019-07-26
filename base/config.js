'use strict';

module.exports = {
    port: process.env.PORT || 8500,
    dbconn: process.env.MLAB || 'mongodb://localhost:27017/workshopdb',
    dbname: process.env.DB_NAME || 'workshopdb',
    enableAuth: getEnableAuth() || false,
    expiresIn: 86400,
    jwt_secret: process.env.JWT_SECRET || 'secret1234',
    userCount: 2
}

function getEnableAuth() {
    if (process.env.ENABLE_AUTH === null) {
        return true
    } else if (process.env.ENABLE_AUTH === undefined) {
        return true
    } else {
        console.log('lain');
        return process.env.ENABLE_AUTH
    }
}
// JSON.parse(process.env.ENABLE_AUTH) ||