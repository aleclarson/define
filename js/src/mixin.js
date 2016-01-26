var mixin, scope;

scope = require("./scope");

mixin = module.exports = function(closure) {
  return function() {
    var target;
    target = scope.getTarget();
    scope.push(target);
    Array.prototype.unshift.call(arguments, this);
    closure.apply(scope.define, arguments);
    scope.pop();
  };
};

//# sourceMappingURL=../../map/src/mixin.map
