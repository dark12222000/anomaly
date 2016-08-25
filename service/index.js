const http = require('http');
const connect = require('connect');

const serviceMiddleware = require('./lib/serviceMiddleware');

let app = connect();

app.use(serviceMiddleware);

//final handler
app.use((req, res)=>{
  res.status = 404;
  return res.end();
});

http.createServer(app).listen(3000);
