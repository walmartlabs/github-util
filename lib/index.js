var _ = require('underscore'),
    config = require('./config');

module.exports = {
  remote: {
    init: function(options) {
      config.load(options);
    },
    gitHub: function() {
      return config.gitHub();
    }
  },

  local: require('./local-info')
};

_.extend(module.exports.remote, require('./changes'));
