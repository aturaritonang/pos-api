'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {

    server.post('/:sufix/api/product', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        let product = req.body;

        if (product.variantId == undefined || product.initial == undefined || product.name == undefined || product.desc == undefined || !product.price || product.active == undefined) {
            return res.send(500, {
                error: true,
                message: 'variantId, initial, name, desc, price, active are required'
            });
        }

        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            if (product.variantId) {
                product.variantId = ObjectID(product.variantId);
            }

            dbo = db.db(config.dbname);

            TimeStamp(product, req);

            await dbo.collection('product' + sufix).insert(product, function (error, response) {
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
    server.get('/:sufix/api/product', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('product' + sufix)
                .aggregate([
                    {
                        $lookup: {
                            from: "variant" + sufix,
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    }, {
                        $unwind: "$variant"
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
    server.get('/:sufix/api/prodtrue', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            await dbo.collection('product' + sufix)
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
    server.get('/:sufix/api/product/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);

            let id = ObjectID(req.params.id);

            await dbo.collection('product' + sufix)
                .aggregate([
                    {
                        $lookup: {
                            from: "variant" + sufix,
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    }, {
                        $unwind: "$variant"
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
    server.put('/:sufix/api/product/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        let id = ObjectID(req.params.id);
        let product = req.body;

        if (product.variantId != undefined || product.initial != undefined || product.name != undefined || product.desc != undefined|| product.price != undefined || product.active != undefined) {
            MongoClient.connect(config.dbconn, async function (err, db) {
                if (err) {
                    return next(new Error(err));
                }

                if (product.variantId) {
                    product.variantId = ObjectID(product.variantId);
                }

                TimeStamp(product, req);

                dbo = db.db(config.dbname);

                await dbo.collection('product' + sufix)
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
            return res.send(500, {
                error: true,
                message: 'No found class: variantId or initial or name or desc or price or active'
            });
        }
    });

    //Route DEL
    server.del('/:sufix/api/product/:id', verifyToken, (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }

            dbo = db.db(config.dbname);
            let id = req.params.id;

            await dbo.collection('product' + sufix).deleteOne({ '_id': ObjectID(id) }, function (error, response) {
                if (error) {
                    return next(new Error(error));
                }

                res.send(200, response);
                db.close();
            });
        });
    });
};