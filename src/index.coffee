
require "lotus-require"

Property = require "./property"
mirror = require "./mirror"
define = require "./define"
mixin = require "./mixin"
scope = require "./scope"

scope.define = ->
  define.apply null, arguments

getOption = (key) -> ->
  return if !scope.define.options?
  scope.define.options[key]

setOption = (key) -> (newValue) ->
  scope.define.options ?= {}
  scope.define.options[key] = newValue

defineEnumerable = (obj, key, config) ->
  config.enumerable = yes
  Object.defineProperty obj, key, config

#
# Exports
#

defineEnumerable module, "exports", value: define

for target in [define, scope.define]
  defineEnumerable target, "mixin", value: mixin
  defineEnumerable target, "mirror", value: mirror

defineEnumerable scope.define, "options",
  get: -> scope.getOptions()
  set: (newValue = {}) ->
    return unless newValue.constructor is Object
    scope.cache[scope.current].options = newValue

for key in Property.validOptions
  defineEnumerable scope.define, key,
    get: getOption key
    set: setOption key
