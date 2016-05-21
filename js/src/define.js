var KeyType, Kind, Property, PureObject, TargetType, assert, assertType, createConfigMixin, define, emptyFunction, isConstructor, isType, parseConfig;

require("isDev");

isConstructor = require("isConstructor");

emptyFunction = require("emptyFunction");

PureObject = require("PureObject");

assertType = require("assertType");

Property = require("Property");

isType = require("isType");

assert = require("assert");

Kind = require("Kind");

if (isDev) {
  TargetType = [Kind(Object), PureObject];
  KeyType = [String];
  if (Symbol) {
    KeyType.push(Symbol);
  }
}

module.exports = define = function(target) {
  var config, configMixin, key, prop, ref, ref1;
  assert(arguments.length > 1, "Must provide at least 2 arguments!");
  if (isDev) {
    assertType(target, TargetType);
  }
  if (arguments.length === 2) {
    ref = arguments[1];
    for (key in ref) {
      config = ref[key];
      config = parseConfig(config);
      prop = Property(config);
      prop && prop.define(target, key);
    }
    return;
  }
  if (isType(arguments[2], Object)) {
    configMixin = createConfigMixin(arguments[1]);
    ref1 = arguments[2];
    for (key in ref1) {
      config = ref1[key];
      config = parseConfig(config);
      configMixin(config);
      prop = Property(config);
      prop && prop.define(target, key);
    }
    return;
  }
  if (isDev) {
    assertType(arguments[1], KeyType);
  }
  config = parseConfig(arguments[2]);
  prop = Property(config);
  prop && prop.define(target, arguments[1]);
};

parseConfig = function(config) {
  if (isConstructor(config, Object)) {
    return config;
  }
  return {
    value: config
  };
};

createConfigMixin = function(mixin) {
  if (!mixin) {
    return emptyFunction;
  }
  if (mixin.constructor !== Object) {
    return emptyFunction;
  }
  return function(config) {
    var key, value;
    for (key in mixin) {
      value = mixin[key];
      if (config[key] === void 0) {
        config[key] = value;
      }
    }
  };
};

//# sourceMappingURL=../../map/src/define.map
