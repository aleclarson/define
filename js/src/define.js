var Kind, Property, PureObject, Target, assert, assertType, createConfigMixin, define, emptyFunction, isConstructor, isType, parseConfig;

isConstructor = require("isConstructor");

emptyFunction = require("emptyFunction");

PureObject = require("PureObject");

assertType = require("assertType");

Property = require("Property");

isType = require("isType");

assert = require("assert");

Kind = require("Kind");

Target = [Kind(Object), PureObject];

module.exports = define = function(target) {
  var config, configMixin, key, prop, ref, ref1;
  assertType(target, Target);
  assert(arguments.length > 1, "Must provide at least 2 arguments!");
  if (arguments.length === 2) {
    ref = arguments[1];
    for (key in ref) {
      config = ref[key];
      config = parseConfig(config);
      prop = Property(config);
      if (!prop) {
        continue;
      }
      prop.define(target, key);
    }
    return;
  }
  if (typeof arguments[1] === "string") {
    config = parseConfig(arguments[2]);
    prop = Property(config);
    if (!prop) {
      return;
    }
    prop.define(target, arguments[1]);
    return;
  }
  if (arguments[2].constructor === Object) {
    configMixin = createConfigMixin(arguments[1]);
    ref1 = arguments[2];
    for (key in ref1) {
      config = ref1[key];
      config = parseConfig(config);
      configMixin(config);
      prop = Property(config);
      if (!prop) {
        continue;
      }
      prop.define(target, key);
    }
  }
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
