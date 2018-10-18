'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {
    //Method post
    server.post('/:sufix/api/variant', verifyToken, (req, res, next) => {

        var sufix = req.params.sufix;
        let entity = req.body;

        if (entity.categoryId == undefined || entity.initial == undefined || entity.name == undefined || entity.active == undefined) {
            var error = new Error('categoryId, initial, name and active are required!');
            error.status = 500;
            return next(error);
        }

        let variant = {};

        variant.categoryId = ObjectID(entity.categoryId);
        variant.initial = entity.initial;
        variant.name = entity.name;
        variant.active = entity.active;

        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            TimeStamp(variant, req);

            await dbo.collection('variant' + sufix).insert(variant, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(201, {
                    message: response
                });

                db.close();
            });
        });
    });

    //Route get all
    server.get('/:sufix/api/variant', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('variant' + sufix)
                .aggregate([
                    {
                        $lookup: {
                            from: "category" + sufix,
                            localField: "categoryId",
                            foreignField: "_id",
                            as: "category"
                        }
                    }, {
                        $unwind: "$category"
                    }, {
                        $project: {
                            'category._id': 0
                        }
                    }
                ]).toArray(function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, response);
                    db.close();
                });
        });
    });

    //Route get all
    server.get('/:sufix/api/varianttrue', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('variant' + sufix)
                .find({ 'active': true }, { '_id': 1, 'initial': 1, 'name': 1, 'price': 1 })
                .toArray(function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, response);
                    db.close();
                });
        });
    });

    //Route get by id
    server.get('/:sufix/api/variant/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            let id = ObjectID(req.params.id);

            await dbo.collection('variant' + sufix)
                .aggregate([
                    {
                        $lookup: {
                            from: "category" + sufix,
                            localField: "categoryId",
                            foreignField: "_id",
                            as: "category"
                        }
                    }, {
                        $unwind: "$category"
                    }, {
                        $match: { '_id': id }
                    }, {
                        $project: {
                            'category._id': 0
                        }
                    }
                ]).toArray(function (error, response) {
                    if (error) {
                        return next(new Error(error));
                    }

                    if (response.length > 0) {
                        res.send(200, response[0]);
                    } else {
                        res.send(200, response);
                    }
                    db.close();
                });
        });
    });

    //Route
    server.put('/:sufix/api/variant/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        let id = ObjectID(req.params.id);
        let variant = req.body;

        if (variant.categoryId || variant.initial || variant.name || variant.active) {
            MongoClient.connect(config.dbconn, async function (err, db) {
                if (err) {
                    return next(new Error(err));
                }

                if (variant.categoryId) {
                    variant.categoryId = ObjectID(variant.categoryId);
                }

                TimeStamp(variant, req);

                dbo = db.db(config.dbname);

                await dbo.collection('variant' + sufix)
                    .findOneAndUpdate({ '_id': id }, { $set: variant }, function (error, response) {
                        if (error) {
                            return next(new Error(error));
                        }

                        res.send(200, {
                            message: response
                        });

                        db.close();
                    });
            });
        } else {
            return res.send(500, {
                error: true,
                message: 'No found class: categoryId or initial or name or desc or price or active'
            });
        }
    });

    //Route DEL
    server.del('/:sufix/api/variant/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            await dbo.collection('variant' + sufix).deleteOne({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });
};