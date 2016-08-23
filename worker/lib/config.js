const convict = require('convict');

let conf = convict({
  env: {
    description: 'The application environment',
    default: 'development',
    env: 'NODE_ENV'
  },
  redis: {
    host: {
      default: '127.0.0.1'
    },
    family: {
      format: [4, 6],
      default: 4
    },
    port: {
      format: 'int',
      default: 6379
    },
    password: {
      default: ''
    },
    db: {
      format: 'int',
      default: 0
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
