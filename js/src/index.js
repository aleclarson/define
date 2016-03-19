var define, defineEnumerable, getOption, i, j, key, len, len1, mirror, mixin, ref, ref1, scope, setOption, target;

require("lotus-require");

mirror = require("./mirror");

define = require("./define");

mixin = require("./mixin");

scope = require("./scope");

scope.define = function() {
  return define.apply(null, arguments);
};

getOption = function(key) {
  return function() {
    if (scope.define.options == null) {
      return;
    }
    return scope.define.options[key];
  };
};

setOption = function(key) {
  return function(newValue) {
    var base;
    if ((base = scope.define).options == null) {
      base.options = {};
    }
    return scope.define.options[key] = newValue;
  };
};

defineEnumerable = function(obj, key, config) {
  config.enumerable = true;
  return Object.defineProperty(obj, key, config);
};

defineEnumerable(module, "exports", {
  value: define
});

ref = [define, scope.define];
for (i = 0, len = ref.length; i < len; i++) {
  target = ref[i];
  defineEnumerable(target, "mixin", {
    value: mixin
  });
  defineEnumerable(target, "mirror", {
    value: mirror
  });
}

defineEnumerable(scope.define, "options", {
  get: function() {
    return scope.getOptions();
  },
  set: function(newValue) {
    if (newValue == null) {
      newValue = {};
    }
    if (newValue.constructor !== Object) {
      return;
    }
    return scope.cache[scope.current].options = newValue;
  }
});

ref1 = Property.validOptions;
for (j = 0, len1 = ref1.length; j < len1; j++) {
  key = ref1[j];
  defineEnumerable(scope.define, key, {
    get: getOption(key),
    set: setOption(key)
  });
}

//# sourceMappingURL=../../map/src/index.map
