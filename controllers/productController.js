'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {

    server.post('/:suffix/api/product', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;

        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            if (product.variantId) {
                product.variantId = ObjectId(product.variantId);
            }

            dbo = db.db(config.dbname);

            let entity = req.body;

            if (entity.variantId == undefined || entity.initial == undefined || entity.name == undefined || entity.description == undefined || entity.price == undefined || entity.active == undefined) {
                return res.send(412, {
                    error: true,
                    message: 'variantId, initial, name, description, price, active are required'
                });
            }

            MatchVariant(dbo, suffix, entity.variantId, (cb) => {
                //console.log(cb);
                if (cb == null) {
                    var error = new Error('Variant not found!');
                    error.status = 412;
                    return next(error);
                }
            });

            let product = {};
            product.variantId = ObjectId(entity.variantId);
            product.initial = entity.initial;
            product.name = entity.name;
            product.description = entity.description;
            product.price = entity.price;
            product.active = entity.active;

            TimeStamp(product, req);

            await dbo.collection('product' + suffix).insert(product, function (error, response) {
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
    server.get('/:suffix/api/product', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('product' + suffix)
                .aggregate([
                    {
                        $lookup: {
                            from: "variant" + suffix,
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    }, {
                        $unwind: { path: "$variant", 'preserveNullAndEmptyArrays': true }
                    }, {
                        $lookup: {
                            from: "category" + suffix,
                            localField: "variant.categoryId",
                            foreignField: "_id",
                            as: "variant.category"
                        }
                    }, {
                        $unwind: { path: "$variant.category", 'preserveNullAndEmptyArrays': true }
                    }, {
                        $project: {
                            'variant._id': 0
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

    //Route get all by variant
    server.get('/:suffix/api/product/variant/:varId', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        var variantId = req.params.varId;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('product' + suffix)
                .aggregate([
                    {
                        $lookup: {
                            from: "variant" + suffix,
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    }, {
                        $unwind: { path: "$variant", 'preserveNullAndEmptyArrays': true }
                    }, {
                        $lookup: {
                            from: "category" + suffix,
                            localField: "variant.categoryId",
                            foreignField: "_id",
                            as: "variant.category"
                        }
                    }, {
                        $unwind: { path: "$variant.category", 'preserveNullAndEmptyArrays': true }
                    }, {
                        $match : { 'variantId' : ObjectId(variantId) }
                    }, {
                        $project: {
                            'variant._id': 0
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
    server.get('/:suffix/api/product/true', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('product' + suffix)
                .find({ 'active': true }, { '_id': 1, 'initial': 1, 'name': 1, 'description': 1, 'price': 1 })
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
    server.get('/:suffix/api/product/:id', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            let id = ObjectId(req.params.id);

            await dbo.collection('product' + suffix)
                .aggregate([
                    {
                        $lookup: {
                            from: "variant" + suffix,
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    }, {
                        $unwind: { path: "$variant", 'preserveNullAndEmptyArrays': true }
                    }, {
                        $match: { '_id': id }
                    }, {
                        $project: {
                            'variant._id': 0
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
    server.put('/:suffix/api/product/:id', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        let id = ObjectId(req.params.id);
        let entity = req.body;

        if (entity.variantId != undefined || entity.initial != undefined || entity.name != undefined || entity.description != undefined || entity.price != undefined || entity.active != undefined) 
        {
            MongoClient.connect(config.dbconn, async function (err, db) {
                if (err) {
                    return next(new Error(err));
                }

                let product = {};

                if (entity.variantId != undefined) {
                    MatchVariant(dbo, suffix, entity.variantId, (cb) => {
                        if (cb == null) {
                            var error = new Error('Variant not found!');
                            error.status = 412;
                            return next(error);
                        }
                    });
                    product.variantId = ObjectId(entity.variantId);
                }

                if(entity.initial != undefined){
                    product.initial = entity.initial;
                }

                if(entity.name != undefined){
                    product.name = entity.name;
                }

                if(entity.description != undefined){
                    product.description = entity.description;
                }

                if(entity.price != undefined){
                    product.price = entity.price;
                }

                if(entity.active != undefined){
                    product.active = entity.active;
                }

                TimeStamp(product, req);

                dbo = db.db(config.dbname);             

                await dbo.collection('product' + suffix)
                    .findOneAndUpdate({ '_id': id }, { $set: product }, function (error, response) {
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
            return res.send(412, {
                error: true,
                message: 'No found class: variantId or initial or name or description or price or active'
            });
        }
    });

    //Route DEL
    server.del('/:suffix/api/product/:id', verifyToken, (req, res, next) => {
        var suffix = req.params.suffix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            await dbo.collection('product' + suffix).deleteOne({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });
};

function MatchVariant(dbo, suffix, id, callback) {
    try {
        dbo.collection('variant' + suffix)
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