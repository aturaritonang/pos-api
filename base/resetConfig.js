'use strict';
const MongoClient = require('mongodb').MongoClient;

let dbo;

function SetConfig(callback) {
    // this.Setting = MongoClient.connect(config.dbconn, async function (err, db) {
    //     if (err) {
    //         return next(new Error(err));
    //     }

    //     dbo = db.db(config.dbname);
    //     await dbo.collection('setConfig').findOne({}, function (error, response) {
    //         db.close();
    //         if (error) {
    //             callback(false);
    //         }
    //         if (response) {
    //             callback(response.enableAuth);
    //         }
    //         //console.log(response);
    //     });
    // });
}

module.exports = new SetConfig();