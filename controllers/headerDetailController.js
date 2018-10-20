'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const TimeStamp = require('../base/timeStamp');

let dbo;

module.exports = exports = function (server) {

}

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

async function GetProductPrice(dbo, sufix, id, callback) {
    //Make sure bahwa id adalah ObjectID
    await dbo.collection('product' + sufix).findOne({ '_id': id }, function (error, response) {
        if (error) {
            callback(null);
        }
        callback(response);
    });
}