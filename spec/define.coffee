
define = require "../src/define"

describe "define()", ->

  it "fails gracefully if the first argument is invalid", ->
    expect -> define()
      .not.toThrow()
    expect -> define 1
      .not.toThrow()

  describe "options.value", ->

    it "sets the backing value of the getter", ->
      obj = {}
      define obj, "foo", { value: 1 }
      expect obj.foo
        .toBe 1

    it "can be defined without an 'options' object", ->
      obj = {}
      define obj, "foo", 1
      expect obj.foo
        .toBe 1

    it "object literals must use an 'options' object", ->
      obj = {}
      value = {}
      define obj, "foo", value
      define obj, "bar", { value }
      expect obj.foo
        .toBe undefined
      expect obj.bar
        .toBe value

  describe "options.enumerable", ->

    it "defaults to true", ->
      obj = {}
      define obj, "foo", 1
      expect Object.keys obj
        .toEqual [ "foo" ]

    it "hides the key from 'Object.keys' when false", ->
      obj = {}
      define obj, "foo", { value: 1, enumerable: no }
      expect obj.foo
        .toBe 1
      expect Object.keys obj
        .toEqual []

  describe "options.writable", ->

    it "defaults to true", ->
      obj = {}
      define obj, "foo", 1
      obj.foo = 2
      expect obj.foo
        .toBe 2

    it "throws an error during a set (when equal to false)", ->
      obj = {}
      define obj, "foo", { value: 1, writable: no }
      if isDev
        expect -> obj.foo = 2
          .toThrowError "'foo' is not writable."
      else
        expect -> obj.foo = 2
          .not.toThrow()
      expect obj.foo
        .toBe 1

  describe "options.reactive", ->

    Tracker = require "tracker"

    it "uses Tracker for dependencies", (done) ->

      spy = jasmine.createSpy()
      obj = {}

      define obj, "foo",
        value: 1
        reactive: yes

      expect obj.foo
        .toBe 1

      Tracker.autorun ->
        spy obj.foo

      obj.foo = 2

      Tracker.afterFlush ->

        expect obj.foo
          .toBe 2

        expect spy.calls.allArgs()
          .toEqual [ [ 1 ], [ 2 ] ]

        done()

  describe "options.get", ->

    it "allows a custom getter", ->
      spy = jasmine.createSpy()
      obj = {}
      define obj, "foo", get: -> spy() or 1
      expect obj.foo
        .toBe 1
      expect spy.calls.count()
        .toBe 1

  describe "options.set", ->

    it "calls 'options.get' if arguments.length > 1", ->
      getSpy = jasmine.createSpy()
      setSpy = jasmine.createSpy()
      obj = {}
      define obj, "foo",
        get: -> getSpy() or 1
        set: (newValue, oldValue) -> setSpy newValue, oldValue
      obj.foo = 2
      expect getSpy.calls.count()
        .toBe 1
      expect setSpy.calls.count()
        .toBe 1
      expect setSpy.calls.argsFor 0
        .toEqual [ 2, 1 ]

  describe "options.willSet", ->

    it "is called before 'options.set'", ->

      obj = {}

      spy = jasmine.createSpy()

      define obj, "key",
        get: -> 1
        set: spy
        willSet: (newValue, oldValue) ->
          spy newValue, oldValue
          newValue + oldValue

      obj.key = 2

      expect spy.calls.argsFor 0
        .toEqual [ 2, 1 ]

      expect spy.calls.argsFor 1
        .toEqual [ 3, 1 ]

      expect spy.calls.count()
        .toBe 2

    it "can be used with 'options.value'", ->

      obj = {}

      spy = jasmine.createSpy()

      define obj, "key",
        value: 1
        willSet: (newValue, oldValue) ->
          spy newValue, oldValue
          newValue + oldValue

      obj.key = 2

      expect spy.calls.count()
        .toBe 1

      expect spy.calls.argsFor 0
        .toEqual [ 2, 1 ]

      expect obj.key
        .toBe 3

  describe "options.frozen", ->

    obj = null

    beforeEach ->
      obj = {}
      define obj, "foo", { value: 1, frozen: yes }

    it "prevents writing when in dev mode", ->
      if isDev
        expect -> obj.foo = 1
        .toThrowError "'foo' is not writable."
      else
        expect -> obj.foo = 1
        .not.toThrow()

    it "prevents redefining when in dev mode", ->
      if isDev
        expect -> Object.defineProperty obj, "foo", { value: 2 }
        .toThrowError "Cannot redefine property: foo"
      else
        expect -> Object.defineProperty obj, "foo", { value: 2 }
        .not.toThrow()

  describe "options.lazy", ->

    it "lazily loads the value", ->
      spy = jasmine.createSpy()
      obj = {}
      define obj, "foo",
        lazy: -> spy() or 1
      expect spy.calls.count()
        .toBe 0
      expect obj.foo
        .toBe 1
      expect spy.calls.count()
        .toBe 1

  describe "options.reactive", ->

    Tracker = require "tracker"

    it "interfaces with a ReactiveVar using a getter and setter", ->

      obj = {}

      define obj, "key", { value: 1, reactive: yes }

      spy = jasmine.createSpy()

      Tracker.autorun ->

        spy obj.key

      obj.key = 2

      deferred = Promise.defer()

      Tracker.afterFlush ->

        expect spy.calls.count()
          .toBe 2

        expect spy.calls.argsFor 0
          .toEqual [ 1 ]

        expect spy.calls.argsFor 1
          .toEqual [ 2 ]

        deferred.fulfill()

      deferred.promise

    it "is non-reactive when accessing the 'oldValue' for 'options.willSet'", ->

      obj = {}

      willSetSpy = jasmine.createSpy()

      define obj, "key",
        value: 1
        reactive: yes
        willSet: (newValue, oldValue) ->
          willSetSpy newValue, oldValue
          return newValue

      autorunSpy = jasmine.createSpy()

      Tracker.autorun ->

        autorunSpy()

        obj.key = 2 # This will only be called once, because the setter is non-reactive.

      obj.key = 3

      deferred = Promise.defer()

      Tracker.afterFlush ->

        expect autorunSpy.calls.count()
          .toBe 1

        expect willSetSpy.calls.count()
          .toBe 2

        expect willSetSpy.calls.argsFor 0
          .toEqual [ 2, 1 ]

        expect willSetSpy.calls.argsFor 1
          .toEqual [ 3, 2 ]

        deferred.fulfill()

      deferred.promise

    it "works with 'options.didSet' as expected", ->

      obj = {}

      didSetSpy = jasmine.createSpy()

      define obj, "key",
        value: 1
        reactive: yes
        didSet: (newValue, oldValue) ->
          didSetSpy newValue, oldValue

      autorunSpy = jasmine.createSpy()

      Tracker.autorun ->
        autorunSpy obj.key

      obj.key = 2

      deferred = Promise.defer()

      Tracker.afterFlush ->

        expect didSetSpy.calls.count()
          .toBe 1

        expect didSetSpy.calls.argsFor 0
          .toEqual [ 2, 1 ]

        expect autorunSpy.calls.count()
          .toBe 2

        expect autorunSpy.calls.argsFor 0
          .toEqual [ 1 ]

        expect autorunSpy.calls.argsFor 1
          .toEqual [ 2 ]

        deferred.fulfill()

      deferred.promise

  describe "calling with a prototype as the target", ->

    describe "options.value", ->

      it "sets the backing value of the getter", ->
        MyType = ->
        define MyType.prototype, "foo", { value: 1 }
        obj = new MyType
        expect obj.foo
          .toBe 1

      it "can be defined without an 'options' object", ->
        MyType = ->
        define MyType.prototype, "foo", 1
        obj = new MyType
        expect obj.foo
          .toBe 1

    describe "options.get", ->

      it "allows a custom getter", ->
        spy = jasmine.createSpy()
        MyType = ->
        define MyType.prototype, "foo",
          get: -> spy() or 1
        obj = new MyType
        expect obj.foo
          .toBe 1
        expect spy.calls.count()
          .toBe 1

    describe "options.set", ->

      it "allows a custom setter", ->
        spy = jasmine.createSpy()
        MyType = ->
        define MyType.prototype, "foo",
          get: emptyFunction
          set: spy
        obj = new MyType
        obj.foo = 1
        expect spy.calls.count()
          .toBe 1
        expect spy.calls.argsFor 0
          .toEqual [ 1 ]

  it "supports defining multiple properties", ->
    obj = {}
    define obj,
      foo: 1
      bar: 2
    expect obj.foo
      .toBe 1
    expect obj.bar
      .toBe 2

  it "supports sharing options between properties", ->
    obj = {}
    define obj, { enumerable: no }, { foo: 1, bar: 2 }
    expect Object.keys(obj).length
      .toBe 0
    expect obj.foo
      .toBe 1
    expect obj.bar
      .toBe 2

  it "supports defining properties on protoless objects", ->
    obj = Object.create null
    define obj, "foo", 1
    expect obj.foo
      .toBe 1
