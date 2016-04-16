var Setter, assertType;

assertType = require("type-utils").assertType;

module.exports = Setter = function(prop, get, set) {
  var needsGet, setter;
  assertType(get, Function);
  assertType(set, Function);
  needsGet = set.length > 1;
  setter = set;
  if (prop.willSet) {
    if (!needsGet) {
      needsGet = prop.willSet.length > 1;
    }
    if (prop.didSet) {
      if (!needsGet) {
        needsGet = prop.didSet.length > 1;
      }
      setter = function(newValue, oldValue) {
        newValue = prop.willSet.call(this, newValue, oldValue);
        set.call(this, newValue, oldValue);
        return prop.didSet.call(this, newValue, oldValue);
      };
    } else {
      setter = function(newValue, oldValue) {
        newValue = prop.willSet.call(this, newValue, oldValue);
        return set.call(this, newValue, oldValue);
      };
    }
  } else if (prop.didSet) {
    if (!needsGet) {
      needsGet = prop.didSet.length > 1;
    }
    setter = function(newValue, oldValue) {
      set.call(this, newValue, oldValue);
      return prop.didSet.call(this, newValue, oldValue);
    };
  }
  if (needsGet) {
    return function(newValue) {
      return setter.call(this, newValue, get.call(this));
    };
  } else {
    return function(newValue) {
      return setter.call(this, newValue);
    };
  }
};

//# sourceMappingURL=../../map/src/setter.map
