'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {
    //Route Get All
    server.get('/:sufix/api/category', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            await dbo.collection('category' + sufix).find({}).toArray(function (error, response) {
                if (error) {
                    return next(new Error(error));
                }
                
                res.send(200, response);

                db.close();
            });
        });
    });

    //Route Get Paging
    server.get('/:sufix/api/category/:page/:number', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            await dbo.collection('category' + sufix).find({}).toArray(function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);

                db.close();
            });
        });
    });

    //Route Get All Active true
    server.get('/:sufix/api/cattrue', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            await dbo.collection('category' + sufix)
                .find({ 'active': true }, { '_id': 1, 'initial': 1, 'name': 1 })
                .toArray(function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, response);

                    db.close();
                });
        });
    });

    //Route Get by Id
    server.get('/:sufix/api/category/:id', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }
            let id = req.params.id;
            dbo = db.db(config.dbname);
            await dbo.collection('category' + sufix).findOne({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });

    //Route Get All Active True
    server.get('/:sufix/api/categorytrue', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            await dbo.collection('category' + sufix)
                .find({ 'active': true }, { '_id': 1, 'initial': 1, 'name': 1 })
                .toArray(function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, response);

                    db.close();
                });
        });
    });

    //Route Post
    server.post('/:sufix/api/category', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let category = req.body;

            // CategoryVal(category);
            TimeStamp(category, req);

            await dbo.collection('category' + sufix).insert(category, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(201, response);
                db.close();
            });
        });
    });

    //Route PUT
    server.put('/:sufix/api/category/:catId', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.catId;

            let category = req.body;
            // CategoryVal(category);
            TimeStamp(category, req);

            await dbo.collection('category' + sufix).findOneAndUpdate({ '_id': ObjectID(id) }, { $set: category }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, {
                    old: response,
                    new: category
                });
                db.close();
            });
        });
    });

    //Route DEL
    server.del('/:sufix/api/category/:id', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            await dbo.collection('category' + sufix).deleteOne({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });
};