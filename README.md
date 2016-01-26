
# define v1.0.0 [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

`define` is `Object.defineProperty` but with **more utility** and **less typing**!

&nbsp;

```sh
npm install --save aleclarson/define#1.0.0
```

&nbsp;

example
-------

```CoffeeScript
Buffer = module.exports = (options) ->

define = require "define"

define Buffer, ->

  @options =
    configurable: no
    writable: no

  @ 
    length:
      get: -> @_length

    _length:
      value: 0
      enumerable: no
      writable: yes

  @ Buffer.prototype, -> @ 

    isEncoding: (encoding) ->

    slice: (start, end) ->
```

&nbsp;

options
-------

These are the options available when defining a property with `define(key, options)`.

#### value

A cache for the current value of the property.

#### get

Called when the property's value is accessed via `obj.prop`.

#### lazy

Just like `options.get`, but the return value is stored after the first call.

#### cache

An `Object` to store the property's value in. This is useful for having a property that you can set with access to said `Object`, but can only get from the outside.

#### set

Called when the property's value is set via `obj.prop = newValue`.

If defined, you must set `options.value` manually via `define.value = newValue` inside `options.set`.

#### willSet

Called before `options.set` is called.

The value you return is passed to `options.set` as the first argument.

#### didSet

Called after `options.set` is called.

This is useful when you want to use `options.value` and still react to when it is set. In contrast, defining `options.set` will stop `options.value` from being used.

#### writable

Can the property's value be changed?

An error will be thrown if you try to set a property that is not writable.

#### enumerable

Can the property be seen with `Object.keys()` or loops?

#### configurable

Can the property be redefined with `define()` or `Object.defineProperty()`?

An error will be thrown if you try to delete or redefine a property that is not configurable.

&nbsp;

tips & tricks
-------------

\+ If you define a `Function` with a capitalized key (like `FooBar`), it is automatically wrapped by a `NamedFunction`.

&nbsp;

testing
-------

To run the tests:

```sh
# In any directory:
npm install -g jasmine-node

# In this repo's directory:
npm test
```

&nbsp;
