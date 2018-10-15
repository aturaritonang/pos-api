'use strict';

module.exports = {
    port: process.env.PORT || 8100,
    dbconn: 'mongodb://admin:admin12345@ds233323.mlab.com:33323/posdb',
    dbname: 'posdb',
    enableAuth: true,
    jwt_secret: 'secret1234',
    userCount: 2
}