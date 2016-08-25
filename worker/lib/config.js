const convict = require('convict');

//configuration management with sane defaults
let conf = convict({
  env: {
    description: 'The application environment',
    default: 'development',
    env: 'NODE_ENV'
  },
  redis: {
    host: {
      default: '127.0.0.1' //localhost is a fairly safe bet
    },
    port: {
      format: 'int',
      default: 6379 //default redis port
    },
    password: {
      default: null
    }
  }
});

let env = conf.get('env');
try {
  conf.loadFile(`${__dirname}/../config/config.${env}.json`);
}catch(e){
  console.log('No config found for current environment');
}

conf.validate({strict: false});
module.exports = conf;
