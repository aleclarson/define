var LazyVar, NamedFunction, Property, ReactiveVar, Setter, assert, assertType, emptyFunction, guard, isProto, ref, setType;

require("isDev");

ref = require("type-utils"), assert = ref.assert, assertType = ref.assertType;

NamedFunction = require("NamedFunction");

emptyFunction = require("emptyFunction");

ReactiveVar = require("reactive-var");

LazyVar = require("lazy-var");

setType = require("setType");

isProto = require("isProto");

guard = require("guard");

Setter = require("./setter");

Property = NamedFunction("Property", function(config) {
  var self;
  if (!config) {
    config = {};
  }
  assertType(config, Object, "config");
  if (config.needsValue && (config.value === void 0)) {
    return null;
  }
  if (isDev) {
    self = {
      DEBUG: config.DEBUG === true,
      simple: true,
      writable: config.writable != null ? config.writable : config.writable = true,
      enumerable: config.enumerable,
      configurable: config.configurable != null ? config.configurable : config.configurable = true
    };
  } else {
    self = {
      simple: true,
      writable: true,
      enumerable: true,
      configurable: true
    };
  }
  setType(self, Property);
  self._parseConfig(config);
  return self;
});

module.exports = Property;

Property.prototype.define = function(target, key) {
  var enumerable, get, getSafely, set, simple, value;
  simple = this.simple, enumerable = this.enumerable;
  if (!isDev) {
    enumerable = true;
  } else {
    if (enumerable === void 0) {
      enumerable = key[0] !== "_";
    }
    if (!enumerable) {
      simple = false;
    }
  }
  if (simple) {
    target[key] = this.value;
    return;
  }
  if (isProto(target)) {
    this._defineProto(target, key, enumerable);
    return;
  }
  if (this.get) {
    get = this.get;
  } else if (this.lazy) {
    value = LazyVar({
      reactive: this.reactive,
      initValue: this.lazy
    });
    get = function() {
      return value.get.call(this);
    };
    getSafely = function() {
      return value._value;
    };
  } else if (this.reactive) {
    value = new ReactiveVar(this.value);
    get = function() {
      return value.get();
    };
    getSafely = function() {
      return value.curValue;
    };
  } else {
    value = this.value;
    get = function() {
      return value;
    };
  }
  if (!this.writable) {
    set = this._makeEmptySetter(key);
  } else if (this.get) {
    if (this.set) {
      set = this.set;
    } else {
      set = this._makeEmptySetter(key);
    }
  } else if (this.lazy) {
    set = function(newValue) {
      return value.set.call(this, newValue);
    };
  } else if (this.reactive) {
    set = function(newValue) {
      return value.set(newValue);
    };
  } else {
    set = function(newValue) {
      return value = newValue;
    };
  }
  if (this.DEBUG) {
    if (GLOBAL.DEFINED == null) {
      GLOBAL.DEFINED = [];
    }
    GLOBAL.DEFINED.push({
      value: value,
      get: get,
      set: set,
      enumerable: enumerable,
      configurable: this.configurable
    });
  }
  Object.defineProperty(target, key, {
    get: get,
    set: Setter(this, getSafely || get, set),
    enumerable: enumerable,
    configurable: this.configurable
  });
};

Object.defineProperties(Property.prototype, {
  _makeEmptySetter: {
    value: function(key) {
      if (isDev) {
        return function() {
          throw Error("'" + key + "' is not writable.");
        };
      } else {
        return emptyFunction;
      }
    }
  },
  _parseConfig: {
    value: function(config) {
      if (isDev) {
        if (config.frozen) {
          this.simple = false;
          this.writable = false;
          this.configurable = false;
        } else if (config.enumerable === false) {
          this.simple = false;
        } else if (config.configurable === false) {
          this.simple = false;
        } else if (config.writable === false) {
          this.simple = false;
        }
      }
      if (config.get) {
        this.simple = false;
        this.get = config.get;
      } else if (config.set) {
        throw Error("Cannot define 'set' without 'get'!");
      } else if (config.lazy) {
        this.simple = false;
        this.lazy = config.lazy;
        if (config.reactive) {
          this.reactive = true;
        }
      } else {
        if (config.reactive) {
          assert(this.writable, "Reactive values must be writable!");
          this.simple = false;
          this.reactive = true;
        }
        this.value = config.value;
      }
      if (this.writable) {
        if (config.set) {
          this.simple = false;
          this.set = config.set;
        }
        if (config.willSet) {
          this.simple = false;
          this.willSet = config.willSet;
        }
        if (config.didSet) {
          this.simple = false;
          this.didSet = config.didSet;
        }
      } else if (config.set) {
        throw Error("Cannot define 'set' when 'writable' is false!");
      } else if (config.willSet) {
        throw Error("Cannot define 'willSet' when 'writable' is false!");
      } else if (config.didSet) {
        throw Error("Cannot define 'didSet' when 'writable' is false!");
      }
    }
  },
  _defineProto: {
    value: function(target, key, enumerable) {
      var configurable, descriptor, get, set, value, writable;
      if (isDev) {
        if (this.lazy) {
          throw Error("Cannot define 'lazy' when the target is a prototype!");
        }
        if (this.reactive) {
          throw Error("Cannot define 'reactive' when the target is a prototype!");
        }
        if (this.willSet) {
          throw Error("Cannot define 'willSet' when the target is a prototype!");
        }
        if (this.didSet) {
          throw Error("Cannot define 'didSet' when the target is a prototype!");
        }
      }
      value = this.value, get = this.get, set = this.set, writable = this.writable, configurable = this.configurable;
      if (get) {
        if (set == null) {
          set = this._makeEmptySetter(key);
        }
        descriptor = {
          get: get,
          set: set,
          enumerable: enumerable,
          configurable: configurable
        };
      } else {
        assert(isDev, "This should never be used out of __DEV__ mode!");
        descriptor = {
          value: value,
          enumerable: enumerable,
          writable: writable,
          configurable: configurable
        };
      }
      Object.defineProperty(target, key, descriptor);
    }
  }
});

//# sourceMappingURL=../../map/src/property.map
