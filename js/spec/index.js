var define;

define = require("../..");

describe("define(Object.Kind, Function)", function() {
  it("calls the function synchronously", function() {
    var calls, obj;
    calls = 0;
    obj = define({}, function() {
      return calls++;
    });
    return expect(calls).toBe(1);
  });
  it("when finished, it resets 'define.options' to its previous value", function() {
    var obj;
    define.options = {
      enumerable: false
    };
    obj = define({}, function() {
      return this.options = {};
    });
    return expect(define.options.enumerable).toBe(false);
  });
  it("supports nesting", function() {
    var MyType;
    MyType = function() {
      return {};
    };
    return define(MyType, function() {
      this.options = {
        enumerable: false,
        value: false
      };
      this(MyType.prototype, function() {
        this("foo");
        this.options = {
          enumerable: true,
          value: true
        };
        return this("moon");
      });
      this("bar");
      expect(MyType.bar).toBe(false);
      expect(Object.keys(MyType)).toEqual([]);
      expect(MyType.prototype.foo).toBe(false);
      expect(MyType.prototype.moon).toBe(true);
      return expect(Object.keys(MyType.prototype)).toEqual(["moon"]);
    });
  });
  return it("returns the target", function() {
    var obj;
    obj = {};
    return expect(define(obj, function() {})).toBe(obj);
  });
});

describe("define(Object.Kind, Object)", function() {
  it("defines all keys in the Object", function() {
    var key, obj, props, results, value;
    props = {
      foo: true,
      bar: true
    };
    obj = define({}, props);
    results = [];
    for (key in props) {
      value = props[key];
      results.push(expect(obj[key]).toBe(props[key]));
    }
    return results;
  });
  it("doesn't reset 'define.options' to its previous value", function() {
    var obj;
    define.options = {
      enumerable: false
    };
    obj = define({}, "_foo", {
      value: true
    });
    expect(define.options).not.toBeNull();
    return define.options = null;
  });
  return it("returns the target", function() {
    var obj;
    obj = {};
    return expect(define(obj, {
      foo: true
    })).toBe(obj);
  });
});

describe("define(Object.Kind, String, Any)", function() {
  it("adds a property", function() {
    var obj;
    obj = define({}, "foo", {
      value: true
    });
    return expect(obj.foo).toBe(true);
  });
  it("doesn't reset 'define.options'", function() {
    var obj;
    define.options = {
      enumerable: false
    };
    obj = define({}, "_foo", {
      value: true
    });
    expect(define.options).not.toBeNull();
    return define.options = null;
  });
  return it("returns the target", function() {
    var obj;
    obj = {};
    return expect(define(obj, {
      foo: true
    })).toBe(obj);
  });
});

describe("define(Object)", function() {
  it("throws if the target isn't defined", function() {
    var error;
    try {
      define({
        foo: true,
        bar: true
      });
    } catch (_error) {
      error = _error;
    }
    expect(error != null).toBe(true);
    return expect(error.code).toBe("MISSING_TARGET");
  });
  return it("adds many properties at once", function() {
    var key, obj, props, value;
    props = {
      foo: true,
      bar: true
    };
    obj = define({}, function() {
      return this(props);
    });
    for (key in props) {
      value = props[key];
      expect(obj[key]).toBe(props[key]);
    }
  });
});

describe("define(String)", function() {
  it("throws if the target isn't defined", function() {
    var error;
    try {
      define("foo");
    } catch (_error) {
      error = _error;
    }
    expect(error != null).toBe(true);
    return expect(error.code).toBe("MISSING_TARGET");
  });
  it("sets the value to undefined", function() {
    var obj;
    obj = define({}, function() {
      return this("foo");
    });
    expect(obj.foo).toBe(void 0);
    expect(obj.hasOwnProperty("foo")).toBe(true);
    return expect(obj.hasOwnProperty("foo")).toBe(true);
  });
  return it("returns the mutable property", function() {
    var obj;
    obj = {};
    return define(obj, function() {
      var prop;
      prop = this("foo");
      prop.get = function() {
        return false;
      };
      return expect(obj.foo).toBe(false);
    });
  });
});

describe("define(String, Any)", function() {
  it("throws if the target isn't defined", function() {
    var error;
    try {
      define("foo", true);
    } catch (_error) {
      error = _error;
    }
    expect(error != null).toBe(true);
    return expect(error.code).toBe("MISSING_TARGET");
  });
  it("treats the second argument as 'options' if it's an Object", function() {
    var obj;
    obj = define({}, function() {
      return this("foo", {
        enumerable: false,
        value: true
      });
    });
    expect(obj.foo).toBe(true);
    return expect(Object.keys(obj)).not.toContain("foo");
  });
  it("treats the second argument as 'options.value' if it's not an Object", function() {
    var obj;
    obj = define({}, function() {
      return this("foo", true);
    });
    return expect(obj.foo).toBe(true);
  });
  return it("returns the mutable property", function() {
    var obj;
    obj = {};
    return define(obj, function() {
      var prop;
      prop = this("foo", true);
      prop.get = function() {
        return false;
      };
      return expect(obj.foo).toBe(false);
    });
  });
});

describe("define(Function)", function() {
  it("creates a new options scope", function() {
    define.options = {
      configurable: false
    };
    define(function() {
      return this.options = {};
    });
    expect(define.options.configurable).toBe(false);
    return define.options = null;
  });
  return it("returns null", function() {
    return expect(define(function() {})).toBe(null);
  });
});

//# sourceMappingURL=../../map/spec/index.map
