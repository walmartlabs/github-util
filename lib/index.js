var _ = require('underscore'),
    config = require('./config');

module.exports = {
  init: function(options) {
    return config.load(options);
  }
};

_.extend(module.exports, require('./local-info'));
