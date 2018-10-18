'use strict';

module.exports = function (entity, req) {
    if (req.method === 'POST') {
        if(!entity.createBy)
        {
            entity.createBy = req.userName;
        }
        entity.createDate = new Date();
    }

    if(!entity.modifyBy)
    {
        entity.modifyBy = req.userName;
    }
    entity.modifyDate = new Date();
}