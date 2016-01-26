
reportFailure = require "report-failure"
ComputedVar = require "computed-var"
ReactiveVar = require "reactive-var"
LazyVar = require "lazy-var"
has = require "has"

scope = require "./scope"

Property = module.exports = (key, data) ->

  #
  # Argument validation
  #

  if key? and key.constructor is Object
    props = key
    Property key, data for key, data of props
    return yes

  if typeof key isnt "string"
    error = TypeError "'key' must be a String."
    error.code = "BAD_KEY_TYPE"
    throw error

  if data? and data.constructor is Object
    options = data

    # If the 'options' object is empty, it becomes 'options.value'
    if Object.keys(options).length is 0
      options = value: options

  else
    options = {}
    options.value = data if has arguments, 1

  #
  # Target validation
  #

  target = scope.getTarget()

  if !target?
    error = Error "No target has been set."
    error.code = "MISSING_TARGET"
    throw error

  #
  # Options setup
  #

  options = scope.createOptions options

  for option, defaultValue of Property.defaultValues
    options[option] = defaultValue unless has options, option

  if options.frozen?
    options.configurable = options.writable = not options.frozen
    delete options.frozen

  #
  # Options processing
  #

  prop = { key }

  for option in Property.validOptions
    prop[option] = options[option] if has options, option

  if isPrototype target

    options =
      enumerable: prop.enumerable
      configurable: prop.configurable

    if has prop, "get"
      options.get = prop.get
      options.set = prop.set if has prop, "set"

    else
      options.value = prop.value
      options.writable = prop.writable

    Object.defineProperty target, key, options

    return target

  if prop.needsValue and !prop.value?
    return target

  if prop.lazy instanceof Function
    prop.value = LazyVar prop.lazy
    delete prop.lazy

  if prop.get instanceof Function
    prop.writable = prop.set?
    getter = ->
      prop.get.call this

  else if prop.reactive
    prop.writable = yes
    prop.value = ReactiveVar prop.value
    if prop.DEBUG
      prop.value.name = prop.key
    getter = ->
      prop.value.get()
    prop.set = (newValue) ->
      prop.value.set newValue

  else if (prop.value instanceof ComputedVar) or (prop.value instanceof LazyVar)
    getter = ->
      prop.value.get.call this
    prop.set = (newValue, oldValue) ->
      prop.value.set.call this, newValue, oldValue

  else if prop.set instanceof Function
    throw Error "'set' cannot be defined without 'get'."

  else
    getter = ->
      prop.value
    prop.set = (newValue) ->
      prop.value = newValue

  setter = createSetter getter, prop

  try
    Object.defineProperty target, prop.key,
      enumerable: prop.enumerable
      configurable: prop.configurable
      get: getter
      set: setter
  catch error
    reportFailure error, { target, prop }

  if has prop, "assign"
    target[prop.key] = prop.assign
    delete prop.assign

  if prop.DEBUG?
    global.DEBUG = { prop, target, getter, setter }

  target

Property.validOptions = [
  "value"
  "assign"
  "lazy"
  "get"
  "set"
  "willSet"
  "didSet"
  "configurable"
  "enumerable"
  "writable"
  "frozen"
  "reactive"
  "needsValue"
  "DEBUG"
]

Property.defaultValues =
  configurable: yes
  enumerable: yes
  writable: yes

createSetter = (getter, prop) ->

  unless prop.writable
    deleteKeys prop, "set", "didSet", "willSet"
    return setter = -> throw Error "'#{prop.key}' is not writable."

  willSet = prop.willSet?
  didSet = prop.didSet?

  if willSet and didSet
    return setter = (newValue) ->
      oldValue = getter.call this
      newValue = prop.willSet.call this, newValue, oldValue
      prop.set.call this, newValue, oldValue
      prop.didSet.call this, newValue, oldValue

  else if willSet
    return setter = (newValue) ->
      oldValue = getter.call this
      newValue = prop.willSet.call this, newValue, oldValue
      prop.set.call this, newValue, oldValue

  else if didSet
    return setter = (newValue) ->
      oldValue = getter.call this
      prop.set.call this, newValue, oldValue
      prop.didSet.call this, newValue, oldValue

  else
    return setter = (newValue) ->
      prop.set.call this, newValue, getter.call this

deleteKeys = (obj, keys...) ->
  delete obj[key] for key in keys

isPrototype = (value) ->
  return no unless value instanceof Object
  value is value.constructor.prototype

isNameableFunction = (value, key) ->
  value instanceof Function and
  value.name is "" and
  startsWithLetter(key) and
  isUppercase(key[0])

isUppercase = (string) ->
  string is string.toUpperCase()

startsWithLetter = (string) ->
  code = string.charCodeAt 0
  code? and (code >= 65 and code <= 90) or (code >= 97 and code <= 122)
