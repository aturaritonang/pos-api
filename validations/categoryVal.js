'use strict';

module.exports = (entity) => {
    let category = {
        initial: (entity.initial) ? entity.initial.substr(10) : null,
        name: (entity.name) ? entity.name.substr(50) : null,
        active: (initial.active) ? true : false
    }
    entity = category;
}