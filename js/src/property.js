var Getter, Property, Setter, defineProperty, definePrototype, isDev, isPrototype, scope, throwFailure;

throwFailure = require("failure").throwFailure;

isDev = require("isDev");

Getter = require("./getter");

Setter = require("./setter");

scope = require("./scope");

Property = module.exports;

Property.define = function(key, data) {
  var defaultValue, error, i, len, option, options, prop, props, ref, ref1, target;
  if (key && (key.constructor === Object)) {
    props = key;
    for (key in props) {
      data = props[key];
      Property.define(key, data);
    }
    return true;
  }
  if (typeof key !== "string") {
    throw TypeError("'key' must be a String!");
  }
  if (data && (data.constructor === Object)) {
    options = data;
    if (Object.keys(options).length === 0) {
      options = {
        value: options
      };
    }
  } else {
    options = {};
    if (arguments.length > 1) {
      options.value = data;
    }
  }
  target = scope.getTarget();
  if (target == null) {
    throw Error("Cannot define without a target!");
  }
  options = scope.createOptions(options);
  ref = Property.optionDefaults;
  for (option in ref) {
    defaultValue = ref[option];
    if (options[option] === void 0) {
      options[option] = defaultValue;
    }
  }
  if (options.frozen === true) {
    options.configurable = options.writable = false;
  }
  prop = {
    key: key
  };
  ref1 = Property.validOptions;
  for (i = 0, len = ref1.length; i < len; i++) {
    option = ref1[i];
    prop[option] = options[option];
  }
  if (isDev) {
    try {
      defineProperty.call(prop, target);
    } catch (_error) {
      error = _error;
      throwFailure(error, {
        target: target,
        prop: prop
      });
    }
  } else {
    defineProperty.call(prop, target);
  }
  return target;
};

Property.validOptions = ["value", "assign", "lazy", "get", "set", "willSet", "didSet", "configurable", "enumerable", "writable", "frozen", "reactive", "needsValue"];

Property.optionDefaults = {
  configurable: true,
  enumerable: true,
  writable: true
};

defineProperty = function(target) {
  if (isPrototype(target)) {
    definePrototype.call(this, target);
    return;
  }
  if (this.needsValue) {
    if (this.value === void 0) {
      return;
    }
  }
  Object.defineProperty(target, this.key, {
    get: this.getter = Getter(this),
    set: this.setter = Setter(this),
    enumerable: this.enumerable,
    configurable: this.configurable
  });
  if (this.assign !== void 0) {
    target[this.key] = this.assign;
    this.assign = void 0;
  }
};

isPrototype = function(value) {
  if (!(value instanceof Object)) {
    return false;
  }
  return value === value.constructor.prototype;
};

definePrototype = function(target) {
  var options;
  options = {
    enumerable: this.enumerable,
    configurable: this.configurable
  };
  if (this.get) {
    options.get = this.get;
    if (this.set) {
      options.set = this.set;
    }
  } else {
    options.value = this.value;
    options.writable = this.writable;
  }
  Object.defineProperty(target, this.key, options);
};

//# sourceMappingURL=../../map/src/property.map
