var define;

define = require("../src/define");

describe("define()", function() {
  it("fails gracefully if the first argument is invalid", function() {
    expect(function() {
      return define();
    }).not.toThrow();
    return expect(function() {
      return define(1);
    }).not.toThrow();
  });
  describe("options.value", function() {
    it("sets the backing value of the getter", function() {
      var obj;
      obj = {};
      define(obj, "foo", {
        value: 1
      });
      return expect(obj.foo).toBe(1);
    });
    it("can be defined without an 'options' object", function() {
      var obj;
      obj = {};
      define(obj, "foo", 1);
      return expect(obj.foo).toBe(1);
    });
    return it("object literals must use an 'options' object", function() {
      var obj, value;
      obj = {};
      value = {};
      define(obj, "foo", value);
      define(obj, "bar", {
        value: value
      });
      expect(obj.foo).toBe(void 0);
      return expect(obj.bar).toBe(value);
    });
  });
  describe("options.enumerable", function() {
    it("defaults to true", function() {
      var obj;
      obj = {};
      define(obj, "foo", 1);
      return expect(Object.keys(obj)).toEqual(["foo"]);
    });
    return it("hides the key from 'Object.keys' when false", function() {
      var obj;
      obj = {};
      define(obj, "foo", {
        value: 1,
        enumerable: false
      });
      expect(obj.foo).toBe(1);
      return expect(Object.keys(obj)).toEqual([]);
    });
  });
  describe("options.writable", function() {
    it("defaults to true", function() {
      var obj;
      obj = {};
      define(obj, "foo", 1);
      obj.foo = 2;
      return expect(obj.foo).toBe(2);
    });
    return it("throws an error during a set (when equal to false)", function() {
      var obj;
      obj = {};
      define(obj, "foo", {
        value: 1,
        writable: false
      });
      if (isDev) {
        expect(function() {
          return obj.foo = 2;
        }).toThrowError("'foo' is not writable.");
      } else {
        expect(function() {
          return obj.foo = 2;
        }).not.toThrow();
      }
      return expect(obj.foo).toBe(1);
    });
  });
  describe("options.reactive", function() {
    var Tracker;
    Tracker = require("tracker");
    return it("uses Tracker for dependencies", function(done) {
      var obj, spy;
      spy = jasmine.createSpy();
      obj = {};
      define(obj, "foo", {
        value: 1,
        reactive: true
      });
      expect(obj.foo).toBe(1);
      Tracker.autorun(function() {
        return spy(obj.foo);
      });
      obj.foo = 2;
      return Tracker.afterFlush(function() {
        expect(obj.foo).toBe(2);
        expect(spy.calls.allArgs()).toEqual([[1], [2]]);
        return done();
      });
    });
  });
  describe("options.get", function() {
    return it("allows a custom getter", function() {
      var obj, spy;
      spy = jasmine.createSpy();
      obj = {};
      define(obj, "foo", {
        get: function() {
          return spy() || 1;
        }
      });
      expect(obj.foo).toBe(1);
      return expect(spy.calls.count()).toBe(1);
    });
  });
  describe("options.set", function() {
    return it("calls 'options.get' if arguments.length > 1", function() {
      var getSpy, obj, setSpy;
      getSpy = jasmine.createSpy();
      setSpy = jasmine.createSpy();
      obj = {};
      define(obj, "foo", {
        get: function() {
          return getSpy() || 1;
        },
        set: function(newValue, oldValue) {
          return setSpy(newValue, oldValue);
        }
      });
      obj.foo = 2;
      expect(getSpy.calls.count()).toBe(1);
      expect(setSpy.calls.count()).toBe(1);
      return expect(setSpy.calls.argsFor(0)).toEqual([2, 1]);
    });
  });
  describe("options.willSet", function() {
    it("is called before 'options.set'", function() {
      var obj, spy;
      obj = {};
      spy = jasmine.createSpy();
      define(obj, "key", {
        get: function() {
          return 1;
        },
        set: spy,
        willSet: function(newValue, oldValue) {
          spy(newValue, oldValue);
          return newValue + oldValue;
        }
      });
      obj.key = 2;
      expect(spy.calls.argsFor(0)).toEqual([2, 1]);
      expect(spy.calls.argsFor(1)).toEqual([3, 1]);
      return expect(spy.calls.count()).toBe(2);
    });
    return it("can be used with 'options.value'", function() {
      var obj, spy;
      obj = {};
      spy = jasmine.createSpy();
      define(obj, "key", {
        value: 1,
        willSet: function(newValue, oldValue) {
          spy(newValue, oldValue);
          return newValue + oldValue;
        }
      });
      obj.key = 2;
      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0)).toEqual([2, 1]);
      return expect(obj.key).toBe(3);
    });
  });
  describe("options.frozen", function() {
    var obj;
    obj = null;
    beforeEach(function() {
      obj = {};
      return define(obj, "foo", {
        value: 1,
        frozen: true
      });
    });
    it("prevents writing when in dev mode", function() {
      if (isDev) {
        return expect(function() {
          return obj.foo = 1;
        }).toThrowError("'foo' is not writable.");
      } else {
        return expect(function() {
          return obj.foo = 1;
        }).not.toThrow();
      }
    });
    return it("prevents redefining when in dev mode", function() {
      if (isDev) {
        return expect(function() {
          return Object.defineProperty(obj, "foo", {
            value: 2
          });
        }).toThrowError("Cannot redefine property: foo");
      } else {
        return expect(function() {
          return Object.defineProperty(obj, "foo", {
            value: 2
          });
        }).not.toThrow();
      }
    });
  });
  describe("options.lazy", function() {
    return it("lazily loads the value", function() {
      var obj, spy;
      spy = jasmine.createSpy();
      obj = {};
      define(obj, "foo", {
        lazy: function() {
          return spy() || 1;
        }
      });
      expect(spy.calls.count()).toBe(0);
      expect(obj.foo).toBe(1);
      return expect(spy.calls.count()).toBe(1);
    });
  });
  describe("options.reactive", function() {
    var Tracker;
    Tracker = require("tracker");
    it("interfaces with a ReactiveVar using a getter and setter", function() {
      var deferred, obj, spy;
      obj = {};
      define(obj, "key", {
        value: 1,
        reactive: true
      });
      spy = jasmine.createSpy();
      Tracker.autorun(function() {
        return spy(obj.key);
      });
      obj.key = 2;
      deferred = Q.defer();
      Tracker.afterFlush(function() {
        expect(spy.calls.count()).toBe(2);
        expect(spy.calls.argsFor(0)).toEqual([1]);
        expect(spy.calls.argsFor(1)).toEqual([2]);
        return deferred.fulfill();
      });
      return deferred.promise;
    });
    it("is non-reactive when accessing the 'oldValue' for 'options.willSet'", function() {
      var autorunSpy, deferred, obj, willSetSpy;
      obj = {};
      willSetSpy = jasmine.createSpy();
      define(obj, "key", {
        value: 1,
        reactive: true,
        willSet: function(newValue, oldValue) {
          willSetSpy(newValue, oldValue);
          return newValue;
        }
      });
      autorunSpy = jasmine.createSpy();
      Tracker.autorun(function() {
        autorunSpy();
        return obj.key = 2;
      });
      obj.key = 3;
      deferred = Q.defer();
      Tracker.afterFlush(function() {
        expect(autorunSpy.calls.count()).toBe(1);
        expect(willSetSpy.calls.count()).toBe(2);
        expect(willSetSpy.calls.argsFor(0)).toEqual([2, 1]);
        expect(willSetSpy.calls.argsFor(1)).toEqual([3, 2]);
        return deferred.fulfill();
      });
      return deferred.promise;
    });
    return it("works with 'options.didSet' as expected", function() {
      var autorunSpy, deferred, didSetSpy, obj;
      obj = {};
      didSetSpy = jasmine.createSpy();
      define(obj, "key", {
        value: 1,
        reactive: true,
        didSet: function(newValue, oldValue) {
          return didSetSpy(newValue, oldValue);
        }
      });
      autorunSpy = jasmine.createSpy();
      Tracker.autorun(function() {
        return autorunSpy(obj.key);
      });
      obj.key = 2;
      deferred = Q.defer();
      Tracker.afterFlush(function() {
        expect(didSetSpy.calls.count()).toBe(1);
        expect(didSetSpy.calls.argsFor(0)).toEqual([2, 1]);
        expect(autorunSpy.calls.count()).toBe(2);
        expect(autorunSpy.calls.argsFor(0)).toEqual([1]);
        expect(autorunSpy.calls.argsFor(1)).toEqual([2]);
        return deferred.fulfill();
      });
      return deferred.promise;
    });
  });
  describe("calling with a prototype as the target", function() {
    describe("options.value", function() {
      it("sets the backing value of the getter", function() {
        var MyType, obj;
        MyType = function() {};
        define(MyType.prototype, "foo", {
          value: 1
        });
        obj = new MyType;
        return expect(obj.foo).toBe(1);
      });
      return it("can be defined without an 'options' object", function() {
        var MyType, obj;
        MyType = function() {};
        define(MyType.prototype, "foo", 1);
        obj = new MyType;
        return expect(obj.foo).toBe(1);
      });
    });
    describe("options.get", function() {
      return it("allows a custom getter", function() {
        var MyType, obj, spy;
        spy = jasmine.createSpy();
        MyType = function() {};
        define(MyType.prototype, "foo", {
          get: function() {
            return spy() || 1;
          }
        });
        obj = new MyType;
        expect(obj.foo).toBe(1);
        return expect(spy.calls.count()).toBe(1);
      });
    });
    return describe("options.set", function() {
      return it("allows a custom setter", function() {
        var MyType, obj, spy;
        spy = jasmine.createSpy();
        MyType = function() {};
        define(MyType.prototype, "foo", {
          get: emptyFunction,
          set: spy
        });
        obj = new MyType;
        obj.foo = 1;
        expect(spy.calls.count()).toBe(1);
        return expect(spy.calls.argsFor(0)).toEqual([1]);
      });
    });
  });
  it("supports defining multiple properties", function() {
    var obj;
    obj = {};
    define(obj, {
      foo: 1,
      bar: 2
    });
    expect(obj.foo).toBe(1);
    return expect(obj.bar).toBe(2);
  });
  it("supports sharing options between properties", function() {
    var obj;
    obj = {};
    define(obj, {
      enumerable: false
    }, {
      foo: 1,
      bar: 2
    });
    expect(Object.keys(obj).length).toBe(0);
    expect(obj.foo).toBe(1);
    return expect(obj.bar).toBe(2);
  });
  return it("supports defining properties on protoless objects", function() {
    var obj;
    obj = Object.create(null);
    define(obj, "foo", 1);
    return expect(obj.foo).toBe(1);
  });
});

//# sourceMappingURL=../../map/spec/define.map
