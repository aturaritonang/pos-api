'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {
    //Post/Insert/Add
    server.post('/:suffix/api/variant', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        try {
            MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
                if (err) {
                    return next(new Error(err));
                }

                dbo = dbase.db(config.dbname);

                let entity = req.body;

                if (entity.categoryId == undefined || entity.initial == undefined || entity.name == undefined || entity.active == undefined) {
                    var error = new Error('categoryId and initial and name and active are required!');
                    error.status = 500;
                    return next(error);
                }

                MatchCategory(dbo, suffix, entity.categoryId, (cb) => {
                    console.log(cb);
                    if (cb == null) {
                        var error = new Error('Category not found!');
                        error.status = 500;
                        return next(error);
                    }
                });

                let variant = {};
                variant.categoryId = ObjectId(entity.categoryId);
                variant.initial = entity.initial;
                variant.name = entity.name;
                variant.active = entity.active;

                TimeStamp(variant, req);

                await dbo.collection('variant' + suffix)
                    .insertOne(variant, function (error, response) {
                        if (error) {
                            return next(new Error(error));
                        }

                        res.send(201, {
                            variant: variant,
                            response: response
                        });
                        dbase.close();
                    });
            });
        } catch (error) {
            var err = new Error(error.message);
            error.status = 500;
            return next(err);
        }
    });


    server.get('/:suffix/api/variant', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }

            dbo = dbase.db(config.dbname);
            await dbo.collection('variant' + suffix)
                .aggregate([
                    {
                        $lookup: {
                            from: 'category' + suffix,
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    }, {
                        $unwind: { path : '$category', 'preserveNullAndEmptyArrays': true }
                    }, {
                        $project: {
                            'category._id': 0
                        }
                    }
                ]).toArray(function (error, docs) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, docs);
                    dbase.close();
                });
        });
    });

    server.get('/:suffix/api/variant/:id', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            dbo = dbase.db(config.dbname);
            await dbo.collection('variant' + suffix)
                .findOne({ "_id": ObjectId(id) }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, doc);
                    dbase.close();
                });
        });
    });

    server.put('/:suffix/api/variant/:id', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;
            let entity = req.body;

            if (entity.categoryId == undefined && entity.initial == undefined && entity.name == undefined && entity.active == undefined) {
                var error = new Error('categoryId or initial or name or active is required!');
                error.status = 500;
                return next(error);
            }

            let variant = {};

            if (entity.categoryId != undefined) {
                variant.categoryId = ObjectId(entity.categoryId);
            }

            if (entity.initial != undefined) {
                variant.initial = entity.initial;
            }

            if (entity.name != undefined) {
                variant.name = entity.name;
            }

            if (entity.active != undefined) {
                variant.active = entity.active;
            }

            TimeStamp(variant, req);

            dbo = dbase.db(config.dbname);
            await dbo.collection('variant' + suffix)
                .findOneAndUpdate({ "_id": ObjectId(id) }, { $set: variant }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, doc);
                    dbase.close();
                });
        });
    });

    server.del('/:suffix/api/variant/:id', verifyToken, (req, res, next) => {
        MongoClient.connect(config.dbconn, { useNewUrlParser: true }, async function (err, dbase) {
            if (err) {
                return next(new Error(err));
            }

            let id = req.params.id;

            dbo = dbase.db(config.dbname);
            await dbo.collection('variant' + suffix)
                .findOneAndDelete({ "_id": ObjectId(id) }, function (error, doc) {
                    if (error) {
                        return next(new Error(error));
                    }

                    res.send(200, doc);
                    dbase.close();
                });
        });
    });
}

function MatchCategory(dbo, suffix, id, callback) {
    try {
        dbo.collection('category' + suffix)
            .findOne({ "_id": ObjectId(id) }, function (error, doc) {
                if (error) {
                    return callback(null);
                }
                console.log(doc);
                return callback(doc);
            });
    } catch (error) {
        return callback(error);
        // throw error;
    }
}