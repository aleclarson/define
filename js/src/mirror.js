var define, defineGetSet, mirror;

define = require("./define");

mirror = module.exports = function(obj, options) {
  var excluded, i, included, j, key, len, len1, ref, ref1, results;
  if (!((options != null) && options.constructor === Object)) {
    options = {};
  }
  if (options.include instanceof Array) {
    included = {};
    ref = options.include;
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      included[key] = true;
    }
  } else {
    if (!(options.exclude instanceof Array)) {
      options.exclude = [];
    }
    excluded = {};
    ref1 = options.exclude;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      key = ref1[j];
      excluded[key] = true;
    }
  }
  results = [];
  for (key in obj) {
    if (!(((included != null) && (included[key] != null)) || (excluded[key] == null))) {
      continue;
    }
    if (obj[key] instanceof Function) {
      results.push(define(key, {
        value: obj[key].bind(obj)
      }));
    } else {
      results.push(defineGetSet(obj, key));
    }
  }
  return results;
};

defineGetSet = function(obj, key) {
  return define(key, {
    get: function() {
      return obj[key];
    },
    set: function(newValue) {
      return obj[key] = newValue;
    }
  });
};

//# sourceMappingURL=../../map/src/mirror.map
