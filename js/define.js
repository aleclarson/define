var Property, assertType, define, defineMany, defineSingle, isConstructor, isType, resolveConfig;

isConstructor = require("isConstructor");

assertType = require("assertType");

Property = require("Property");

isType = require("isType");

module.exports = define = function(target, arg2, arg3) {
  assertType(target, Property.targetType);
  if (isType(arg2, Property.keyType)) {
    return defineSingle(target, arg2, arg3);
  }
  if (isConstructor(arg2, Object)) {
    return defineMany(target, arg2);
  }
  throw TypeError("Expected a String, Symbol, or Object as the 2nd argument!");
};

defineSingle = function(target, key, config) {
  var prop;
  prop = Property(resolveConfig(config));
  prop && prop.define(target, key);
};

defineMany = function(target, configs) {
  var config, key, prop;
  for (key in configs) {
    config = configs[key];
    prop = Property(resolveConfig(config));
    prop && prop.define(target, key);
  }
};

resolveConfig = function(config) {
  if (isConstructor(config, Object)) {
    return config;
  }
  return {
    value: config
  };
};

//# sourceMappingURL=map/define.map
