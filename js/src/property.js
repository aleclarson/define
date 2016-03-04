var ComputedVar, LazyVar, Property, ReactiveVar, createSetter, deleteKeys, has, isNameableFunction, isPrototype, isUppercase, scope, startsWithLetter, throwFailure,
  slice = [].slice;

throwFailure = require("failure").throwFailure;

ComputedVar = require("computed-var");

ReactiveVar = require("reactive-var");

LazyVar = require("lazy-var");

has = require("has");

scope = require("./scope");

Property = module.exports = function(key, data) {
  var defaultValue, error, getter, i, len, option, options, prop, props, ref, ref1, setter, target;
  if ((key != null) && key.constructor === Object) {
    props = key;
    for (key in props) {
      data = props[key];
      Property(key, data);
    }
    return true;
  }
  if (typeof key !== "string") {
    error = TypeError("'key' must be a String.");
    error.code = "BAD_KEY_TYPE";
    throw error;
  }
  if ((data != null) && data.constructor === Object) {
    options = data;
    if (Object.keys(options).length === 0) {
      options = {
        value: options
      };
    }
  } else {
    options = {};
    if (has(arguments, 1)) {
      options.value = data;
    }
  }
  target = scope.getTarget();
  if (target == null) {
    error = Error("No target has been set.");
    error.code = "MISSING_TARGET";
    throw error;
  }
  options = scope.createOptions(options);
  ref = Property.defaultValues;
  for (option in ref) {
    defaultValue = ref[option];
    if (!has(options, option)) {
      options[option] = defaultValue;
    }
  }
  if (options.frozen != null) {
    options.configurable = options.writable = !options.frozen;
    delete options.frozen;
  }
  prop = {
    key: key
  };
  ref1 = Property.validOptions;
  for (i = 0, len = ref1.length; i < len; i++) {
    option = ref1[i];
    if (has(options, option)) {
      prop[option] = options[option];
    }
  }
  if (isPrototype(target)) {
    options = {
      enumerable: prop.enumerable,
      configurable: prop.configurable
    };
    if (has(prop, "get")) {
      options.get = prop.get;
      if (has(prop, "set")) {
        options.set = prop.set;
      }
    } else {
      options.value = prop.value;
      options.writable = prop.writable;
    }
    Object.defineProperty(target, key, options);
    return target;
  }
  if (prop.needsValue && (prop.value == null)) {
    return target;
  }
  if (prop.get instanceof Function) {
    prop.writable = prop.set != null;
    getter = function() {
      return prop.get.call(this);
    };
  } else if (prop.set instanceof Function) {
    throw Error("'set' cannot be defined without 'get'!");
  } else if (prop.reactive) {
    prop.writable = true;
    prop.value = new ReactiveVar(prop.value);
    getter = function() {
      return prop.value.get();
    };
    prop.set = function(newValue) {
      return prop.value.set(newValue);
    };
  } else {
    if (prop.lazy instanceof Function) {
      prop.value = LazyVar(prop.lazy);
      delete prop.lazy;
    }
    if ((prop.value instanceof ComputedVar) || (prop.value instanceof LazyVar)) {
      getter = function() {
        return prop.value.get.call(this);
      };
      prop.set = function(newValue, oldValue) {
        return prop.value.set.call(this, newValue, oldValue);
      };
    } else {
      getter = function() {
        return prop.value;
      };
      prop.set = function(newValue) {
        return prop.value = newValue;
      };
    }
  }
  setter = createSetter(getter, prop);
  try {
    Object.defineProperty(target, prop.key, {
      enumerable: prop.enumerable,
      configurable: prop.configurable,
      get: getter,
      set: setter
    });
  } catch (_error) {
    error = _error;
    throwFailure(error, {
      target: target,
      prop: prop
    });
  }
  if (has(prop, "assign")) {
    target[prop.key] = prop.assign;
    delete prop.assign;
  }
  if (prop.DEBUG != null) {
    global.DEBUG = {
      prop: prop,
      target: target,
      getter: getter,
      setter: setter
    };
  }
  return target;
};

Property.validOptions = ["value", "assign", "lazy", "get", "set", "willSet", "didSet", "configurable", "enumerable", "writable", "frozen", "reactive", "needsValue", "DEBUG"];

Property.defaultValues = {
  configurable: true,
  enumerable: true,
  writable: true
};

createSetter = function(getter, prop) {
  var didSet, setter, willSet;
  if (!prop.writable) {
    deleteKeys(prop, "set", "didSet", "willSet");
    return setter = function() {
      throw Error("'" + prop.key + "' is not writable.");
    };
  }
  willSet = prop.willSet != null;
  didSet = prop.didSet != null;
  if (willSet && didSet) {
    return setter = function(newValue) {
      var oldValue;
      oldValue = getter.call(this);
      newValue = prop.willSet.call(this, newValue, oldValue);
      prop.set.call(this, newValue, oldValue);
      return prop.didSet.call(this, newValue, oldValue);
    };
  } else if (willSet) {
    return setter = function(newValue) {
      var oldValue;
      oldValue = getter.call(this);
      newValue = prop.willSet.call(this, newValue, oldValue);
      return prop.set.call(this, newValue, oldValue);
    };
  } else if (didSet) {
    return setter = function(newValue) {
      var oldValue;
      oldValue = getter.call(this);
      prop.set.call(this, newValue, oldValue);
      return prop.didSet.call(this, newValue, oldValue);
    };
  } else {
    return setter = function(newValue) {
      return prop.set.call(this, newValue, getter.call(this));
    };
  }
};

deleteKeys = function() {
  var i, key, keys, len, obj, results;
  obj = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  results = [];
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    results.push(delete obj[key]);
  }
  return results;
};

isPrototype = function(value) {
  if (!(value instanceof Object)) {
    return false;
  }
  return value === value.constructor.prototype;
};

isNameableFunction = function(value, key) {
  return value instanceof Function && value.name === "" && startsWithLetter(key) && isUppercase(key[0]);
};

isUppercase = function(string) {
  return string === string.toUpperCase();
};

startsWithLetter = function(string) {
  var code;
  code = string.charCodeAt(0);
  return (code != null) && (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
};

//# sourceMappingURL=../../map/src/property.map
