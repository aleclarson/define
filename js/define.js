var Property, define, defineMany, defineSingle, isConstructor, resolveConfig;

isConstructor = require("isConstructor");

Property = require("Property");

define = function(target, arg2, arg3) {
  if (isConstructor(arg2, Object)) {
    return defineMany(target, arg2);
  }
  return defineSingle(target, arg2, arg3);
};

module.exports = define;

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
