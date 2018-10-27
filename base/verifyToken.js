const jwt = require('jsonwebtoken');
//const SetConfig = require('../base/resetConfig');

module.exports = function (req, res, next) {
    try {
        if (config.enableAuth) {
            var token = req.headers['x-access-token'] || req.body.token || req.query.token;
            if (token) {
                jwt.verify(token, config.jwt_secret, function (error, decode) {
                    if (error) {
                        return res.send(401, {
                            error: true,
                            message: 'Unauthorized or expired token'
                        });
                    }
                    // console.log(decode);
                    req.decode = decode;
                    req.userName = decode.userName;
                    next();
                });
            } else {
                return res.send(401, {
                    error: true,
                    message: 'Unauthorized, token not found'
                });
            }
        } else {
            next();
        }
    } catch (error) {
        res.send(400, {
            error: true,
            message: 'Error verification : ' + error.message
        });
    }
}