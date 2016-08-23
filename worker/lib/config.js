const convict = require('convict');

let conf = convict({
  env: {
    description: 'The application environment',
    default: 'development',
    env: 'NODE_ENV'
  },
  redis: {
    host: {
      format: 'url',
      default: 'http://localhost'
    },
    port: {
      format: 'int',
      default: 6379
    },
    password: {
      format: 'string',
      default: ''
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
