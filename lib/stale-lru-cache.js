var LRUCache = require("lru-cache");

function StaleLRUCache(options) {
  options = options || {};
  options.maxAge = options.maxAge || 1000 * 60;
  options.staleAge = options.staleAge || 1000 * 60;
  this.maxAge = options.maxAge;
  this.staleAge = options.staleAge;
  options.maxAge = options.maxAge + options.staleAge;
  this.cache = new LRUCache(options);
};

StaleLRUCache.prototype.set = function(key, value) {
  var now = new Date().getTime();
  var item = {
    setAt: now,
    expiresAt: now + this.maxAge,
    value: value
  };
  this.cache.set(key, item);
};

StaleLRUCache.prototype.get = function(key) {
  var now = new Date().getTime();
  var result = {
    hasExpired: false,
    isLocked: false
  };
  var cacheValue = this.cache.get(key);
  result.value = cacheValue.value;
  if (cacheValue.expiresAt <= now) {
    result.hasExpired = true;
  }
  if (this.lockedKeys[key]) {
    result.isLocked = true;
  }
  return result;
};

StaleLRUCache.prototype.lockKey = function(key) {
  var hasBeenLocked = false;
  var now;
  var value = this.get(key);
  if (value && !this.lockedKeys[key]) {
    hasBeenLocked = true;
    now = new Date().getTime();
    this.lockedKeys[key] = {
      key: key,
      lockedAt: now,
      expiresAt: now + (1000 * 10)
    };
  }
  return hasBeenLocked;
};

StaleLRUCache.prototype.unlockKey = function(key) {
  var hasBeenUnlocked = false;
  if (this.lockedKeys[key]) {
    delete this.lockedKeys[key];
  }
  return hasBeenUnlocked;
};

StaleLRUCache.prototype.expireLockedKeys = function() {
  var now = new Date().getTime();
  var _lockedKeys = {};
  this.lockedKeys.forEach(function(lockedKey) {
    if (!lockedKey.expiresAt <= now) {
      _lockedKeys[lockedKey.key] = lockedKey;
    }
  });
  this.lockedKeys = _lockedKeys;
};

module.exports = StaleLRUCache;