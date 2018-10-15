const jwt = require('jsonwebtoken');
//const SetConfig = require('../base/resetConfig');

module.exports = function (req, res, next) {
    try {
        // getConfig(function(callback) {
        //     config.enableAuth = callback;
        //     // console.log(callback);
        // });
        if (config.enableAuth) {
            var token = req.headers['x-access-token'] || req.body.token || req.query.token;
            if (token) {
                jwt.verify(token, config.jwt_secret, function (error, decode) {
                    if (error) {
                        return res.send(403, {
                            error: true,
                            message: 'No authentication'
                        });
                    }
                    console.log(decode);
                    req.decode = decode;
                    next();
                });
            } else {
                return res.send(403, {
                    error: true,
                    message: 'No token found'
                });
            }
        } else {
            next();
        }
    } catch (error) {
        res.send(403, {
            error: true,
            message: 'Error verification',
            auth: config.enableAuth
        });
    }
}

function getConfig(callback) {
    MongoClient.connect(config.dbconn, async function (err, db) {
        if (err) {
            return next(new Error(err));
        }

        dbo = db.db(config.dbname);
        dbo.collection('setConfig').findOne({}, function (error, response) {
            db.close();
            if (error) {
                return callback(false);
            }
            if (response) {
                return callback(response.enableAuth);
            }
            //console.log(response);
        });
    });
}
