var mixin, scope;

scope = require("./scope");

mixin = module.exports = function(closure) {
  return function(target) {
    if (target == null) {
      target = scope.getTarget();
    }
    scope.push(target);
    closure.call(scope.define);
    scope.pop();
    return target;
  };
};

//# sourceMappingURL=../../map/src/mixin.map
