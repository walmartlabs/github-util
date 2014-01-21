var _ = require('underscore'),
    config = require('./config');

module.exports = {
  remote: {
    init: function(options) {
      return config.load(options);
    }
  },

  local: require('./local-info')
};

_.extend(module.exports.remote, require('./changes'));
