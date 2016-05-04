var Kind, Property, createConfigMixin, define, emptyFunction, isConstructor, isType, parseConfig, ref;

ref = require("type-utils"), isType = ref.isType, isConstructor = ref.isConstructor, Kind = ref.Kind;

emptyFunction = require("emptyFunction");

Property = require("Property");

define = function(target) {
  var config, configMixin, key, prop, ref1, ref2;
  if (!target) {
    return;
  }
  if (arguments.length === 1) {
    return;
  }
  if (arguments.length === 2) {
    ref1 = arguments[1];
    for (key in ref1) {
      config = ref1[key];
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
    ref2 = arguments[2];
    for (key in ref2) {
      config = ref2[key];
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

module.exports = define;

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
