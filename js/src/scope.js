var merge;

module.exports = {
  current: 0,
  cache: [
    {
      target: null,
      options: null
    }
  ],
  push: function(target) {
    var options;
    options = {};
    merge(options, this.getOptions());
    this.cache.push({
      target: target,
      options: options
    });
    return this.current++;
  },
  pop: function() {
    this.current--;
    return this.cache.pop();
  },
  call: function(callback) {
    this.push(this.target);
    callback.call(this.define);
    this.pop();
  },
  createOptions: function(userOptions) {
    var options;
    options = {};
    merge(options, this.getOptions());
    merge(options, userOptions);
    return options;
  },
  getOptions: function() {
    return this.cache[this.current].options;
  },
  getTarget: function() {
    return this.cache[this.current].target;
  }
};

merge = function(target, source) {
  var key, results, value;
  if ((source != null ? source.constructor : void 0) !== Object) {
    return;
  }
  results = [];
  for (key in source) {
    value = source[key];
    results.push(target[key] = value);
  }
  return results;
};

//# sourceMappingURL=../../map/src/scope.map
