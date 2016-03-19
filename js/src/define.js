var Property, define, inArray, isDataValid, isTargetValid, scope;

Property = require("./property");

inArray = require("in-array");

scope = require("./scope");

define = module.exports = function(target, data) {
  var ctr, error;
  if (!isTargetValid(target)) {
    if (global.failure == null) {
      global.failure = {
        value: target,
        isValid: isTargetValid
      };
    }
    error = TypeError("'target' has an unexpected type: '" + (target != null ? target.constructor : void 0) + "'");
    error.code = "BAD_TARGET_TYPE";
    throw error;
  }
  ctr = target.constructor;
  if (arguments.length > 1) {
    if (ctr === String) {
      return Property.define(target, data);
    }
  } else {
    if ((ctr === String) || (ctr === Object)) {
      return Property.define(target);
    }
    if (ctr === Function) {
      return scope.call(target);
    }
  }
  if (!isDataValid(data)) {
    if (global.failure == null) {
      global.failure = {
        value: data,
        isValid: isDataValid
      };
    }
    error = TypeError("'data' has an unexpected type: '" + (data != null ? data.constructor : void 0) + "'");
    error.code = "BAD_DATA_TYPE";
    throw error;
  }
  scope.push(target);
  ctr = data.constructor;
  if (ctr === Function) {
    data.call(scope.define);
  } else if (ctr === Object) {
    Property.define(data);
  } else if (ctr === String) {
    Property.define(data, arguments[2]);
  }
  scope.pop();
  return target;
};

isDataValid = function(value) {
  return (value != null) && inArray([String, Object, Function], value.constructor);
};

isTargetValid = function(value) {
  return (value != null) && ((value.constructor === String) || (value.constructor === void 0) || (value.constructor instanceof Object));
};

//# sourceMappingURL=../../map/src/define.map
