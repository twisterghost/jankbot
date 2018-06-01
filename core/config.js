const logger = require('./logger.js');
const { defaults } = require('lodash');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'config.json');

const BASE_CONFIG = {
  username: '',
  password: '',
  admins: [],
  dictionary: 'english.json',
};

let loadedConfig = {};

if (fs.existsSync(CONFIG_PATH)) {
  try {
    loadedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    logger.error(error);
  }
}

module.exports = defaults(loadedConfig, BASE_CONFIG);
