var Getter, LazyGetter, LazyVar, ReactiveGetter, ReactiveVar, SimpleGetter, ValueGetter, getType;

ReactiveVar = require("reactive-var");

LazyVar = require("lazy-var");

module.exports = Getter = function(prop) {
  return getType(prop)(prop);
};

getType = function(prop) {
  if (prop.get) {
    return SimpleGetter;
  }
  if (prop.set) {
    throw Error("'set' cannot be defined without 'get'!");
  }
  if (prop.lazy) {
    return LazyGetter;
  }
  if (prop.reactive) {
    return ReactiveGetter;
  }
  return ValueGetter;
};

SimpleGetter = function(prop) {
  prop.writable = prop.set !== void 0;
  return function() {
    return prop.get.call(this);
  };
};

LazyGetter = function(prop) {
  prop.value = LazyVar({
    initValue: prop.lazy,
    reactive: prop.reactive
  });
  if (prop.writable === true) {
    prop.set = function(newValue) {
      return prop.value.set.call(this, newValue);
    };
  } else {
    prop.set = void 0;
  }
  prop.lazy = void 0;
  return function() {
    return prop.value.get.call(this);
  };
};

ReactiveGetter = function(prop) {
  prop.writable = true;
  prop.value = new ReactiveVar(prop.value);
  prop.set = function(newValue) {
    return prop.value.set(newValue);
  };
  return function() {
    return prop.value.get();
  };
};

ValueGetter = function(prop) {
  prop.set = function(newValue) {
    return prop.value = newValue;
  };
  return function() {
    return prop.value;
  };
};

//# sourceMappingURL=../../map/src/getter.map
