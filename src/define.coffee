
require "isDev"

isConstructor = require "isConstructor"
emptyFunction = require "emptyFunction"
PureObject = require "PureObject"
assertType = require "assertType"
Property = require "Property"
isType = require "isType"
assert = require "assert"
Kind = require "Kind"

if isDev
  TargetType = [ Kind(Object), PureObject ]
  KeyType = [ String ]
  KeyType.push Symbol if Symbol

module.exports =
define = (target) ->

  assert arguments.length > 1, "Must provide at least 2 arguments!"
  assertType target, TargetType if isDev

  if arguments.length is 2
    for key, config of arguments[1]
      config = parseConfig config
      prop = Property config
      prop and prop.define target, key
    return

  if isType arguments[2], Object
    configMixin = createConfigMixin arguments[1]
    for key, config of arguments[2]
      config = parseConfig config
      configMixin config
      prop = Property config
      prop and prop.define target, key
    return

  assertType arguments[1], KeyType if isDev
  config = parseConfig arguments[2]
  prop = Property config
  prop and prop.define target, arguments[1]
  return

parseConfig = (config) ->
  return config if isConstructor config, Object
  return { value: config }

createConfigMixin = (mixin) ->
  return emptyFunction unless mixin
  return emptyFunction if mixin.constructor isnt Object
  return (config) ->
    config[key] = value for key, value of mixin when config[key] is undefined
    return
