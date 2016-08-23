const repo = require('./lib/repoController');

repo.update()
.then(function(results){
  console.log('Repo Updated');
})
.catch(function(err){
  console.log('Error', err);
  process.exit(1);
});
