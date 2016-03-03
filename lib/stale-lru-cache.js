var LRUCache = require("lru-cache");

function SWRCache(options) {
  this.cache = new LRUCache(options);
};

SWRCache.prototype.set = function(key, value, maxAge) {
  var item = {
    setAtTime: new Date().getTime(),
    value: value
  };
  this.cache.set(key, item, maxAge);
};

SWRCache.prototype.get = function(key) {
  var result = {
    hasExpired: false
  };
  var cacheValue = LRUCache.get(key);
  result.value = cacheValue.value;
};

module.exports = SWRCache;