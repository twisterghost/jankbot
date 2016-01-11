var fs = require('fs');
var path = require('path');
var logger = require('../core/logger.js');
var CONFIG = require('../data/config.json');
var _ = require('lodash');
var packageInfo = require('../package.json');
var semver = require('semver');

var JANKBOT_VERSION = packageInfo.version;

var modulePaths = [];

function loadModulesFromPath(modulePath, moduleList) {
  modulePath = path.join(__dirname, '..', modulePath);

  if (fs.existsSync(modulePath)) {
    fs.readdirSync(modulePath).forEach(function (dir) {
      fs.readdirSync(path.join(modulePath, dir)).forEach(function (file) {

        // Load up the modules based on their module.json file.
        if (file === 'module.json') {

          // Get the module config file to load the module itself.
          var moduleConfigPath = path.join(modulePath, dir, file);
          var moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath));

          // Use the 'main' property in the config file to load the module.
          logger.log('Loading module ' + moduleConfig.name + ' by ' + moduleConfig.author + '...');
          var module = require(path.join(modulePath, dir, moduleConfig.main));

          // Check to see if the module has a setDictionary function defined, if so, call it.
          if (module.setDictionary) {
            module.setDictionary(CONFIG.dictionary);
          }

          // Check if the module is compatible with this version of Jankbot.
          if (module.compatible || moduleConfig.compatible) {
            var moduleCompatibility = module.compatible || moduleConfig.compatible;
            var compatibility = semver.satisfies(JANKBOT_VERSION, moduleCompatibility);
            if (compatibility === false) {
              logger.log('WARNING: Module ' + moduleConfig.name + ' is not compatible with this ' +
                'version of Jankbot and may function improperly or cause crashes.');
            }
          } else {
            logger.log('WARNING: Module ' + moduleConfig.name + ' does not specify compatibility.');
          }

          // Finally, add the module to the modules list.
          moduleList.push(module);
        }
      });
    });
    logger.log('Loaded ' + moduleList.length + ' module(s) from ' + modulePath);
  } else {
    logger.log('Path ' + modulePath + ' could not be resolved.');
  }
}

exports.loadModules = function() {
  var moduleList = [];

  _.each(modulePaths, function(path) {
    loadModulesFromPath(path, moduleList);
  });

  return moduleList;
};

exports.addModulePath = function(path) {
  modulePaths.push(path);
};

