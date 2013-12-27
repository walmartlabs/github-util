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
  },
  firstCommit: function(callback) {
    childProcess.exec('git rev-list HEAD --max-parents=0 --abbrev-commit', function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      callback(undefined, stdout.split('\n')[0]);
    });
  },

  commitTime: function(sha, callback) {
    childProcess.exec('git show ' + sha, function(err, stdout, stderr) {
      var time;
      if (!err && /Date:\s*(.*)/.exec(stdout)) {
        time = dateFormat(new Date(RegExp.$1), 'isoUtcDateTime');
      }
      callback(err, time);
    });
  },

  ensureClean: function(callback) {
    childProcess.exec('git diff-index --name-only HEAD --', function(err, stdout, stderr) {
      callback(err, !err && !stdout.length);
    });
  },

  ensureFetched: function(callback) {
    childProcess.exec('git fetch', function(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      childProcess.exec('git branch -v --no-color | grep -e "^\\*"', function(err, stdout, stderr) {
        if (err) {
          callback(err);
        } else if (/\[behind (.*)\]/.test(stdout)) {
          callback(undefined, false, {behind: RegExp.$1});
        } else {
          callback(undefined, true);
        }
      });
    });
  }
};
