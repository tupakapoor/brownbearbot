var fs = require('fs');
var types = require('hapi').types;
var bots = fs.readdirSync(__dirname);

module.exports =
bots
  .filter(function(file) { return file.indexOf('index') != 0; })
  .map(function(file) {

    var config = require('./' + file.substring(0, file.length-3));

    // set default validations
    var bot = {
      path:   config.path,
      method: config.method || 'POST',
      config: config
    };

    // remove invalid keys from the `config` attribute
    delete config.path;
    delete config.method;

    return bot;
  });
