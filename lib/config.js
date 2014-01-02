var Github = require('github-api');

var config;

module.exports.load = function(options) {
  if (options.token) {
    config = options;
  } else {
    var path = options.configFile || '~/.config/github-util';
    path = path.replace(/^~\//, getUserHome() + '/');
    return require(path);
  }
};

module.exports.get = function() {
  return config;
};

module.exports.gitHub = function() {
  if (!config) {
    throw new Error('Must initialize before calling APIs');
  }

  return new Github(config);
};

// http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}
