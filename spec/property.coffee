
Property = require "../src/property"

describe "Property()", ->

  it "supports writable properties", ->

    prop = Property { value: 1 }

    expect prop.simple
      .toBe yes

    expect prop.writable
      .toBe yes

    prop.define obj = {}, "foo"
    expect obj.foo
      .toBe 1

    obj.foo = 2
    expect obj.foo
      .toBe 2

  it "supports unwritable properties", ->

    prop = Property { writable: no, value: 1 }

    expect prop.simple
      .toBe not isDev

    prop.define obj = {}, "foo"
    expect obj.foo
      .toBe 1

    if isDev
      expect -> obj.foo = 2
        .toThrow()

  it "supports frozen properties", ->

    prop = Property { frozen: yes, value: 1 }

    expect prop.simple
      .toBe no

    expect prop.writable
      .toBe no

    expect prop.configurable
      .toBe no

    prop.define obj = {}, "foo"
    expect obj.foo
      .toBe 1

    if isDev

      expect -> obj.foo = 2
        .toThrow()

      expect -> prop.define obj, "foo"
        .toThrow()
