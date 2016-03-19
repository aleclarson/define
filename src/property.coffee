
{ throwFailure } = require "failure"

isDev = require "isDev"

Getter = require "./getter"
Setter = require "./setter"
scope = require "./scope"

Property = module.exports

Property.define = (key, data) ->

  if key and (key.constructor is Object)
    props = key
    Property.define key, data for key, data of props
    return yes

  if typeof key isnt "string"
    throw TypeError "'key' must be a String!"

  if data and (data.constructor is Object)
    options = data

    # If the 'options' object is empty, it becomes 'options.value'
    if Object.keys(options).length is 0
      options = value: options

  else
    options = {}
    if arguments.length > 1
      options.value = data

  target = scope.getTarget()

  unless target?
    throw Error "Cannot define without a target!"

  options = scope.createOptions options

  for option, defaultValue of Property.optionDefaults
    options[option] = defaultValue if options[option] is undefined

  if options.frozen is yes
    options.configurable = options.writable = no

  prop = { key }

  for option in Property.validOptions
    prop[option] = options[option]

  if isDev
    try defineProperty.call prop, target
    catch error then throwFailure error, { target, prop }
  else defineProperty.call prop, target
  return target

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
]

Property.optionDefaults =
  configurable: yes
  enumerable: yes
  writable: yes

defineProperty = (target) ->

  if isPrototype target
    definePrototype.call this, target
    return

  if @needsValue
    return if @value is undefined

  Object.defineProperty target, @key, {
    get: @getter = Getter this
    set: @setter = Setter this
    @enumerable
    @configurable
  }

  if @assign isnt undefined
    target[@key] = @assign
    @assign = undefined
  return

isPrototype = (value) ->
  return no unless value instanceof Object
  return value is value.constructor.prototype

definePrototype = (target) ->

  options = {
    @enumerable
    @configurable
  }

  if @get
    options.get = @get
    options.set = @set if @set

  else
    options.value = @value
    options.writable = @writable

  Object.defineProperty target, @key, options
  return
