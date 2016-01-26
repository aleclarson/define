
has = require "has"

define = require "../.."

describe "define(Object.Kind, Function)", ->

  it "calls the function synchronously", ->
    calls = 0
    obj = define {}, -> calls++
    expect(calls).toBe 1

  it "when finished, it resets 'define.options' to its previous value", ->
    define.options = enumerable: no
    obj = define {}, -> @options = {}
    expect(define.options.enumerable).toBe no

  it "supports nesting", ->
    MyType = -> {}
    define MyType, ->
      @options = enumerable: no, value: no
      @ MyType.prototype, ->
        @ "foo"
        @options = enumerable: yes, value: yes
        @ "moon"
      @ "bar"
      expect(MyType.bar).toBe no
      expect(Object.keys MyType).toEqual []
      expect(MyType::foo).toBe no
      expect(MyType::moon).toBe yes
      expect(Object.keys MyType.prototype).toEqual ["moon"]

  it "returns the target", ->
    obj = {}
    expect(define obj, ->).toBe obj

describe "define(Object.Kind, Object)", ->

  it "defines all keys in the Object", ->
    props = foo: yes, bar: yes
    obj = define {}, props
    expect(obj[key]).toBe props[key] for key, value of props

  it "doesn't reset 'define.options' to its previous value", ->
    define.options = enumerable: no
    obj = define {}, "_foo", value: yes
    expect(define.options).not.toBeNull()
    define.options = null

  it "returns the target", ->
    obj = {}
    expect(define obj, foo: yes).toBe obj

describe "define(Object.Kind, String, Any)", ->

  it "adds a property", ->
    obj = define {}, "foo", value: yes
    expect(obj.foo).toBe yes

  it "doesn't reset 'define.options'", ->
    define.options = enumerable: no
    obj = define {}, "_foo", value: yes
    expect(define.options).not.toBeNull()
    define.options = null

  it "returns the target", ->
    obj = {}
    expect(define obj, foo: yes).toBe obj

describe "define(Object)", ->

  it "throws if the target isn't defined", ->
    try define foo: yes, bar: yes
    catch error
    expect(error?).toBe yes
    expect(error.code).toBe "MISSING_TARGET"

  it "adds many properties at once", ->
    props = foo: yes, bar: yes
    obj = define {}, -> @ props
    expect(obj[key]).toBe props[key] for key, value of props
    return

describe "define(String)", ->

  it "throws if the target isn't defined", ->
    try define "foo"
    catch error
    expect(error?).toBe yes
    expect(error.code).toBe "MISSING_TARGET"

  it "sets the value to undefined", ->
    obj = define {}, -> @ "foo"
    expect(obj.foo).toBe undefined
    expect(has obj, "foo").toBe yes
    expect(has obj, "foo").toBe yes

  it "returns the mutable property", ->
    obj = {}
    define obj, ->
      prop = @ "foo"
      prop.get = -> no
      expect(obj.foo).toBe no

describe "define(String, Any)", ->

  it "throws if the target isn't defined", ->
    try define "foo", yes
    catch error
    expect(error?).toBe yes
    expect(error.code).toBe "MISSING_TARGET"

  it "treats the second argument as 'options' if it's an Object", ->
    obj = define {}, -> @ "foo", { enumerable: no, value: yes }
    expect(obj.foo).toBe yes
    expect(Object.keys obj).not.toContain "foo"

  it "treats the second argument as 'options.value' if it's not an Object", ->
    obj = define {}, -> @ "foo", yes
    expect(obj.foo).toBe yes

  it "returns the mutable property", ->
    obj = {}
    define obj, ->
      prop = @ "foo", yes
      prop.get = -> no
      expect(obj.foo).toBe no

describe "define(Function)", ->

  it "creates a new options scope", ->
    define.options = configurable: no
    define -> @options = {}
    expect(define.options.configurable).toBe no
    define.options = null

  it "returns null", ->
    expect(define ->).toBe null
