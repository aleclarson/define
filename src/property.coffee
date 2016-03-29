
{ assertType } = require "type-utils"

NamedFunction = require "named-function"
emptyFunction = require "emptyFunction"
ReactiveVar = require "reactive-var"
LazyVar = require "lazy-var"
setType = require "setType"
isProto = require "isProto"
isDev = require "isDev"
guard = require "guard"

Setter = require "./setter"

Property = NamedFunction "Property", (config) ->

  config = {} unless config

  assertType config, Object, "config"

  if config.needsValue and (config.value is undefined)
    return null

  if isDev
    self =
      simple: yes
      writable: config.writable ?= yes
      enumerable: config.enumerable
      configurable: config.configurable ?= yes
    self.DEBUG = yes if config.DEBUG
  else
    self =
      simple: yes
      writable: yes
      enumerable: yes
      configurable: yes

  setType self, Property

  parseConfig.call self, config

  return self

module.exports = Property

Property::define = (target, key) ->

  if isProto target
    defineProto.call this, target, key
    return

  { simple, enumerable } = this

  if isDev
    if enumerable is undefined
      enumerable = key[0] isnt "_"
    unless enumerable
      simple = no
  else
    enumerable = yes

  if simple
    target[key] = @value
    return

  if @get
    get = @get

  else if @lazy

    value = LazyVar { @reactive, initValue: @lazy }

    get = ->
      value.get.call this

    getSafely = ->
      value._value

  else if @reactive

    value = new ReactiveVar @value

    get = ->
      value.get()

    getSafely = ->
      value.curValue

  else

    value = @value

    get = ->
      value

  unless @writable
    if isDev then set = -> throw Error "'#{key}' is not writable."
    else set = emptyFunction

  else if @get
    if @set then set = @set
    else set = -> throw Error "'#{key}' is not writable."

  else if @lazy
    set = (newValue) ->
      value.set.call this, newValue

  else if @reactive
    set = (newValue) ->
      value.set newValue

  else
    set = (newValue) ->
      value = newValue

  options = {
    get
    set: Setter this, getSafely or get, set
    enumerable
    @configurable
  }

  if @DEBUG
    console.log "\n"
    console.log "options.get = " + options.get.toString()
    console.log "options.set = " + options.set.toString()
    console.log "set = " + set.toString()

  Object.defineProperty target, key, options
  return

#
# Helpers
#

parseConfig = (config) ->

  if isDev

    if config.frozen
      @simple = no
      @writable = no
      @configurable = no

    else if config.enumerable is no
      @simple = no

    else if config.configurable is no
      @simple = no

    else if config.writable is no
      @simple = no

  if config.get
    @simple = no
    @get = config.get

  else if config.set
    throw Error "Cannot define 'set' without 'get'!"

  else if config.lazy
    @simple = no
    @lazy = config.lazy
    @reactive = yes if config.reactive

  else
    hasValue = yes
    @value = config.value

    if config.reactive
      @simple = no
      @reactive = yes

  if @writable

    if hasValue
      @set = (newValue) =>
        @value = newValue

    if config.set
      @simple = no
      @set = config.set

    if config.willSet
      @simple = no
      @willSet = config.willSet

    if config.didSet
      @simple = no
      @didSet = config.didSet

  else if config.set
    throw Error "Cannot define 'set' when 'writable' is false!"

  else if config.willSet
    throw Error "Cannot define 'willSet' when 'writable' is false!"

  else if config.didSet
    throw Error "Cannot define 'didSet' when 'writable' is false!"

  return

defineProto = (target, key) ->

  if @get
    Object.defineProperty target, key, {
      @get
      set: @set or -> throw Error "'#{key}' is not writable."
      @enumerable
      @configurable
    }

  else if isDev and @lazy
    throw Error "Cannot define 'lazy' when the target is a prototype!"

  else if isDev and @reactive
    throw Error "Cannot define 'reactive' when the target is a prototype!"

  else
    target[key] = @value

  return
