
isConstructor = require "isConstructor"
assertType = require "assertType"
Property = require "Property"
isType = require "isType"

module.exports =
define = (target, arg2, arg3) ->

  assertType target, Property.targetType

  if isType arg2, Property.keyType
    return defineSingle target, arg2, arg3

  if isConstructor arg2, Object
    return defineMany target, arg2

  throw TypeError "Expected a String, Symbol, or Object as the 2nd argument!"

defineSingle = (target, key, config) ->
  prop = Property resolveConfig config
  prop and prop.define target, key
  return

defineMany = (target, configs) ->
  for key, config of configs
    prop = Property resolveConfig config
    prop and prop.define target, key
  return

resolveConfig = (config) ->
  return config if isConstructor config, Object
  return { value: config }
