'use strict';

module.exports = {
    port: process.env.PORT || 8500,
    dbconn: process.env.PORT ? 'mongodb://admin:admin12345@ds233323.mlab.com:33323/posdb' : 'mongodb://localhost:27017/workshopdb',
    dbname: process.env.PORT ? 'posdb' : 'workshopdb',
    enableAuth: true,
    expiresIn: 86400,
    jwt_secret: 'secret1234',
    userCount: 2
}