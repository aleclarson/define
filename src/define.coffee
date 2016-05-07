
{ Kind, isType, isConstructor, assert, assertType } = require "type-utils"

emptyFunction = require "emptyFunction"
Property = require "Property"

Target = [
  Kind(Object)
  null
]

module.exports =
define = (target) ->

  assertType target, Target

  assert arguments.length > 1, "Must provide at least 2 arguments!"

  if arguments.length is 2
    for key, config of arguments[1]
      config = parseConfig config
      prop = Property config
      continue unless prop
      prop.define target, key
    return

  if typeof arguments[1] is "string"
    config = parseConfig arguments[2]
    prop = Property config
    return unless prop
    prop.define target, arguments[1]
    return

  if arguments[2].constructor is Object
    configMixin = createConfigMixin arguments[1]
    for key, config of arguments[2]
      config = parseConfig config
      configMixin config
      prop = Property config
      continue unless prop
      prop.define target, key
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
