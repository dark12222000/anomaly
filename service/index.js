const http = require('http'); //serve over http
const connect = require('connect'); //connect for standardized middleware

const serviceMiddleware = require('./lib/serviceMiddleware'); //our actual service

let app = connect(); //create a new connect instance

app.use(serviceMiddleware); //hook up our middleware

//final handler to throw 404s
app.use((req, res)=>{
  res.status = 404;
  return res.end();
});

//actually set up our app
http.createServer(app).listen(3000);
