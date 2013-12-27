var _ = require('underscore'),
    childProcess = require('child_process'),
    dateFormat = require('dateformat'),
    fs = require('fs');

module.exports = {
  githubName: function(callback) {
    childProcess.exec('git remote -v', function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      var matcher = /(.+)\s+.*github.com[:\/]?(.*)\.git/g,
          repos = {};
      while (matcher.exec(stdout)) {
        var remoteName = RegExp.$1,
            repoName = RegExp.$2;
        repos[remoteName] = repoName;
      }
      callback(undefined, repos.origin || _.values(repos)[0]);
    });
  }
};
