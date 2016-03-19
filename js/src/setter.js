var DidSetter, EmptySetter, Setter, SimpleSetter, WillDidSetter, WillSetter, emptyFunction, getType, isDev;

emptyFunction = require("emptyFunction");

isDev = require("isDev");

module.exports = Setter = function(prop) {
  var setter;
  if (!prop.writable) {
    return EmptySetter;
  }
  setter = getType(prop)(prop);
  return function(newValue) {
    return setter.call(this, newValue, prop.getter.call(this));
  };
};

getType = function(prop) {
  if (prop.willSet) {
    if (prop.didSet) {
      return WillDidSetter;
    } else {
      return WillSetter;
    }
  } else if (prop.didSet) {
    return DidSetter;
  } else {
    return SimpleSetter;
  }
};

SimpleSetter = function(prop) {
  return function(newValue, oldValue) {
    return prop.set.call(this, newValue, oldValue);
  };
};

EmptySetter = function(prop) {
  prop.willSet = prop.set = prop.didSet = void 0;
  if (!isDev) {
    return emptyFunction;
  }
  return function() {
    throw Error("'" + prop.key + "' is not writable.");
  };
};

WillSetter = function(prop) {
  return function(newValue, oldValue) {
    newValue = prop.willSet.call(this, newValue, oldValue);
    return prop.set.call(this, newValue, oldValue);
  };
};

DidSetter = function(prop) {
  return function(newValue, oldValue) {
    prop.set.call(this, newValue, oldValue);
    return prop.didSet.call(this, newValue, oldValue);
  };
};

WillDidSetter = function(prop) {
  return function(newValue, oldValue) {
    newValue = prop.willSet.call(this, newValue, oldValue);
    prop.set.call(this, newValue, oldValue);
    return prop.didSet.call(this, newValue, oldValue);
  };
};

//# sourceMappingURL=../../map/src/setter.map
