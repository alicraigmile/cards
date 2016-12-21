var _ = require('underscore');

module.exports = {
    hasItem: function(str) {
        return ! _.isEmpty(str);
    },  
    hasTitle: function(obj) {
        return ! _.isEmpty(obj.title);
    }
};
