'use strict';

const MongoClient = require('mongodb').MongoClient;
const TimeStamp = require('../base/timeStamp');
const jwt = require('jsonwebtoken');
let dbo;

module.exports = exports = function (server) {
    //Login authentication
    server.post('/:sufix/api/auth', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            let user = req.body;
            if (!user.userName || !user.password) {
                return res.send(500, {
                    error: true,
                    message: 'UserName and Password required!'
                });
            }

            dbo = db.db(config.dbname);

            await dbo.collection('user' + sufix)
                .findOne({ 'userName': user.userName }, function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    if (response) {
                        if (user.password === response.password) {
                            delete response.password;
                            let token = jwt.sign({
                                userName: user.userName,
                                sufix: sufix
                            }, config.jwt_secret, { expiresIn: config.expiresIn });

                            response.token = token;
                            res.send(200, response);
                            db.close();
                        } else {
                            res.send(500, {
                                error: true,
                                message: 'User name or password invalid!'
                            });
                            db.close();
                        }
                    } else {
                        if (user.userName === 'admin') {
                            TimeStamp(user, req);
                            if (user.password.length >= 6) {
                                dbo.collection('user' + sufix).insertOne(user, function (error, resAdmin) {
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
                                res.send(500, {
                                    error: true,
                                    message: 'Password must be equals and more than 6 chars'
                                });
                            }
                        } else {
                            res.send(500, {
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