'use strict';

const MongoClient = require('mongodb').MongoClient;
const TimeStamp = require('../base/timeStamp');
const jwt = require('jsonwebtoken');
let dbo;

module.exports = exports = function (server) {
    //Login authentication
    server.post('/:suffix/api/auth', (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            let user = req.body;
            if (!user.userName || !user.password) {
                return res.send(401, {
                    error: true,
                    message: 'UserName and Password required!'
                });
            }

            dbo = db.db(config.dbname);

            await dbo.collection('user' + suffix)
                .findOne({ 'userName': user.userName }, function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    if (response) {
                        if (user.password === response.password) {
                            delete response.password;
                            let token = jwt.sign({
                                userName: user.userName,
                                suffix: suffix
                            }, config.jwt_secret, { expiresIn: config.expiresIn });

                            response.token = token;
                            res.send(200, response);
                            db.close();
                        } else {
                            res.send(401, {
                                error: true,
                                message: 'User name or password invalid!'
                            });
                            db.close();
                        }
                    } else {
                        if (user.userName === 'admin') {
                            TimeStamp(user, req);
                            if (user.password.length >= 6) {
                                dbo.collection('user' + suffix).insertOne(user, function (error, resAdmin) {
                                    if (error) {
                                        return next(new Error(error));
                                    }
                                    res.send(200, {
                                        error: false,
                                        message: 'Create new Admin, please relogin',
                                        user: user
                                    });
                                    db.close();
                                });
                            } else {
                                res.send(401, {
                                    error: true,
                                    message: 'Password must be equals and more than 6 chars'
                                });
                            }
                        } else {
                            res.send(401, {
                                error: true,
                                message: 'User name or password invalid!'
                            });
                            db.close();
                        }
                    }
                });
        });
    });
}