/* eslint global-require: 0, import/no-dynamic-require: 0 */
const fs = require('fs');
const path = require('path');
const logger = require('../core/logger.js');
const CONFIG = require('../data/config.json');
const _ = require('lodash');
const packageInfo = require('../package.json');
const semver = require('semver');

const JANKBOT_VERSION = packageInfo.version;

class ModuleLoader {
  constructor() {
    this.modulePaths = [];
  }

  addModulePath(modulePath) {
    this.modulePaths = this.modulePaths.concat(modulePath);
  }

  getModules() {
    let moduleList = [];

    _.each(this.modulePaths, (modulePath) => {
      moduleList = moduleList.concat(ModuleLoader.loadModulesFromPath(modulePath));
    });

    return moduleList;
  }

  static loadModulesFromPath(rawModulePath) {
    let moduleList = [];
    const modulePath = path.join(__dirname, '..', rawModulePath);

    if (fs.existsSync(modulePath)) {
      fs.readdirSync(modulePath).forEach((dir) => {
        fs.readdirSync(path.join(modulePath, dir)).forEach((file) => {
          // Load up the modules based on their module.json file.
          if (file === 'module.json') {
            // Get the module config file to load the module itself.
            const moduleConfigPath = path.join(modulePath, dir, file);
            const moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath));

            // Use the 'main' property in the config file to load the module.
            logger.log(`Loading module ${moduleConfig.name} by ${moduleConfig.author}...`);
            const module = require(path.join(modulePath, dir, moduleConfig.main));

            // Check to see if the module has a setDictionary function defined, if so, call it.
            if (module.setDictionary) {
              module.setDictionary(CONFIG.dictionary);
            }

            // Check if the module is compatible with this version of Jankbot.
            if (module.compatible || moduleConfig.compatible) {
              const moduleCompatibility = module.compatible || moduleConfig.compatible;
              const compatibility = semver.satisfies(JANKBOT_VERSION, moduleCompatibility);
              if (compatibility === false) {
                logger.log(`WARNING: Module ${moduleConfig.name} is not compatible with this ` +
                  'version of Jankbot and may function improperly or cause crashes.');
              }
            } else {
              logger.log(`WARNING: Module ${moduleConfig.name} does not specify compatibility.`);
            }

            // Finally, add the module to the modules list.
            moduleList = moduleList.concat(module);
          }
        });
      });
      return moduleList;
    }
    logger.log(`Path "${modulePath}" could not be resolved.`);
    return [];
  }
}

module.exports = ModuleLoader;
