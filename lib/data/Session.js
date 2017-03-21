const model = require('modella');
const DataConfig = require('./DataConfig');
const path = require('path');
const nedb = require('modella-nedb')(DataConfig.dbPath('sessions'));

var Session = model('Session')
  .attr('_id')
  .attr('characterName', { unique: true })
  .attr('characterCode', { unique: true })
  .attr('username')
  .attr('password');

Session.use(nedb);

module.exports = Session;
