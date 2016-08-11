
isConstructor = require "isConstructor"
Property = require "Property"

define = (target, arg2, arg3) ->
  if isConstructor arg2, Object
    return defineMany target, arg2
  return defineSingle target, arg2, arg3

module.exports = define

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
