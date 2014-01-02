var config = require('./config');

module.exports = {
  init: function(options) {
    return config.load(options);
  },

  localInfo: require('./local-info')
};
