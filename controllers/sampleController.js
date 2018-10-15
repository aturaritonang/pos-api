'use strict';

module.exports = exports = function(server) {

    let dataList = [
        { _id: 1, initial: 'FRU', name: 'Fruit' },
        { _id: 2, initial: 'VEG', name: 'Vegetable' },
        { _id: 3, initial: 'MEAT', name: 'Meat' },
        { _id: 4, initial: 'EGG', name: 'Egg' },
        { _id: 5, initial: 'MLK', name: 'Milk' }
    ];

    let newId = dataList.length + 1;

    //Route get all array
    server.get('/api/sample', (req, res, next) => {
        res.send(200, {
            message: 'This is response from GET Sample',
            data: dataList
        });
    });

    //Route get by id
    server.get('/api/sample/:id', (req, res, next) => {
        var id = req.params.id;
        var item = dataList.find(o => {
            return o._id == id
        });
        res.send(200, {
            id: id,
            message: 'This is response from GET Sample by id',
            data: item
        });
    });

    //Route post new
    server.post('/api/sample', (req, res, next) => {
        var item = {
            _id: newId,
            initial: req.body.initial,
            name: req.body.name
        };

        dataList.push(item);

        newId++;

        res.send(201, {
            message: 'This is response from POST Sample',
            data: item
        });
        // console.log(item);
    });

    //Route delete one
    server.del('/api/sample/:id', (req, res, next) => {
        var id = req.params.id;
        var idx = dataList.findIndex(o => o._id == id);
        var item = dataList[idx];
        res.send(200, {
            message: 'This is response from DEL Sample',
            data: item
        });
        dataList.splice(idx, 1);
    });

    //Route update one
    server.put('/api/sample/:id', (req, res, next) => {
        var id = req.params.id;
        var idx = dataList.findIndex(o => o._id == id);
        var oldItem = dataList[idx];
        var newItem = {
            _id: oldItem._id,
            initial: req.body.initial,
            name: req.body.name
        }

        res.send(200, {
            message: 'This is response from PUT Sample',
            old: oldItem,
            new: newItem
        });
        
        dataList[idx] = newItem;
    });
}