'use strict';

module.exports = function (entity, req) {
    if (req.method === 'POST') {
        if(!entity.createBy)
        {
            entity.createBy = null;
        }
        entity.createDate = new Date();
    }

    if(!entity.modifyBy)
    {
        entity.modifyBy = null;
    }
    entity.modifyDate = new Date();
}