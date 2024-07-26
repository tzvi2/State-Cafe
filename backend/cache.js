// cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); // TTL of 100 seconds, check every 120 seconds

module.exports = cache;
