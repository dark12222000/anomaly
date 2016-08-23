/*
 * Clone or Pull from remote origin repo intelligently
 */
const REPO_PATH = './../../repo'; //keep this out of our own git root
const mkdirp = require('mkdirp');

mkdirp.sync(REPO_PATH); //idempotent
const git = require('simple-git')(REPO_PATH);

const ORIGIN = 'https://github.com/firehol/blocklist-ipsets.git';

module.exports = {
  /*
   * Clone from the remote into our repo directory
   */
  clone: function(cb){
    console.log('Cloning repo, this may take a moment...');
    git.outputHandler(function (command, stdout, stderr) {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);
    }).clone(ORIGIN, '.', {'--depth':'1', '--branch': 'master'}, cb);
  },
  /*
   * Pull latest from origin on branch master
   */
  pull: function(cb){
    console.log('Pulling latest repo changes, this may take a moment...');
    git.outputHandler(function (command, stdout, stderr) {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);
    }).pull('origin', 'master', cb);
  },
  /*
   * Gets repo status, used to check if our repo is cloned and valid
   */
  status: function(cb){
    git.status(cb);
  },
  /*
   * Checks repo status, if no status or err does a clone, otherwise pulls
   * @returns a promise
   */
  update: function(){
    return new Promise(function(resolve, reject){
      function genericCB(err, results){
        console.log(err, results);
        if(err) return reject(err);
        return resolve(results);
      }
      module.exports.status(function(err, status){
        if(err || !status){
          return module.exports.clone(genericCB);
        }else{
          return module.exports.pull(genericCB);
        }
      });
    });
  }
};
