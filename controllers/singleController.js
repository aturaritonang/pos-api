function SingleController(dbo, collection, id, callback) {
    dbo.collection(collection).findOne({ '_id': id }, function (error, response) {
        if (error) {
            console.log(error);
            return error;
        }
        return callback(response);
    });
}