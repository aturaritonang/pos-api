'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {
    //Route POS
    server.post('/:sufix/api/orderDet', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }
            dbo = db.db(config.dbname);
            GetNewReference(dbo, sufix, response => {
                let order = req.body;
                order.reference = response;

                res.send(201, {
                    data: order
                });
            });
        });
    });

    //Route get Report
    server.get('/:sufix/api/orderreport', (req, res, next) => {
        var sufix = req.params.sufix;
        MongoClient.connect(config.dbconn, async function (err, db) {
            if (err) {
                return next(new Error(err));
            }
            dbo = db.db(config.dbname);

            dbo.collection('orderHeader' + sufix)
                .aggregate([
                    { $lookup: { from: 'orderDetail' + sufix, localField: '_id', foreignField: 'headerId', as: 'details' } },
                    { $unwind: { path: '$details', 'preserveNullAndEmptyArrays': true } },
                    { $lookup: { from: 'product' + sufix, localField: 'details.productId', foreignField: '_id', as: 'details.product' } },
                    { $unwind: { path: '$details.product', 'preserveNullAndEmptyArrays': true } },
                    {
                        $group: {
                            "_id": "$_id",
                            "payment": "$payment",
                            "createDate": { "$first": "$createDate" },
                            "reference": { "$first": "$reference" },
                            "payment": { "$first": "$payment" },
                            "details": { "$push": "$details" }
                        }
                    },
                    {
                        $project: {
                            "details.createDate": 0,
                            "details.modifyDate": 0,
                            "details.active": 0,
                            "details.headerId": 0,
                            "details.productId": 0,
                            "details.product.active": 0,
                        }
                    },
                    {
                        $sort: {
                            "reference": -1
                        }
                    }
                ]).toArray(function (err, response) {
                    if (err) {
                        return next(new Error(err));
                    }

                    res.send(200, response);
                });
        });
    });

    function GetNewReference(dbo, sufix, callback) {
        var newRef = "SLS-" + new Date().getFullYear().toString().substr(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-";
        var lastRef = "0001";

        dbo.collection('orderHeader' + sufix).aggregate(
            [
                {
                    $match: { "reference": { $regex: ".*" + newRef + ".*" } }
                },
                {
                    $group: {
                        _id: null,
                        maxValue: { $max: "$reference" }
                    }
                }
            ]
        ).toArray(function (error, response) {
            if (error) {
                return next(new Error(error));
            }

            if (response && response.length > 0) {
                var arr = response[0].maxValue.split("-");
                var inc = parseInt(arr[2]) + 1;
                lastRef = newRef + ("0000" + inc).slice(-4);
                return callback(lastRef);
            } else {
                return callback(newRef + lastRef);
            }
        });
    }
}