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
    server.get('/:sufix/api/cattrue', verifyToken, (req, res, next) => {
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
    server.get('/:sufix/api/category/:id', verifyToken, (req, res, next) => {
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
    server.get('/:sufix/api/categorytrue', verifyToken, (req, res, next) => {
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
    server.post('/:sufix/api/category', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;

        let entity = req.body;

        if (entity.initial == undefined || entity.name == undefined || entity.active == undefined) {
            var error = new Error('initial, name and active are required!');
            error.status = 500;
            return next(error);
        }

        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let category = {};

            category.initial = entity.initial;
            category.name = entity.name;
            category.active = entity.active;

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
    server.put('/:sufix/api/category/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;

        let entity = req.body;

        if (entity.initial == undefined && entity.name == undefined && entity.active == undefined) {
            var error = new Error('initial or name or active are required!');
            error.status = 500;
            return next(error);
        }

        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            let category = {};

            if (entity.initial != undefined) {
                category.initial = entity.initial;
            }

            if (entity.name != undefined) {
                category.name = entity.name;
            }

            if (entity.active != undefined) {
                category.active = entity.active;
            }

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
    server.del('/:sufix/api/category/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            await dbo.collection('category' + sufix).findOneAndDelete({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });
};