const http = require('http'); //serve over http
const connect = require('connect'); //connect for standardized middleware

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const config = require('./lib/config');
const serviceMiddleware = require('./lib/serviceMiddleware'); //our actual service

function main(){
  let app = connect(); //create a new connect instance

  app.use(serviceMiddleware); //hook up our middleware

  //final handler to throw 404s
  app.use((req, res)=>{
    res.status = 404;
    return res.end();
  });

  //actually set up our app
  http.createServer(app).listen(config.get('port'));
}

function startCluster(){
  if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    main();
  }
}

if(config.get('cluster')){
  startCluster();
}else{
  main();
}
