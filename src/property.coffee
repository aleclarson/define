
require "isDev"

{ assert, assertType, setType } = require "type-utils"
{ throwFailure } = require "failure"

NamedFunction = require "NamedFunction"
emptyFunction = require "emptyFunction"
ReactiveVar = require "reactive-var"
LazyVar = require "lazy-var"
isProto = require "isProto"
guard = require "guard"

Setter = require "./setter"

Property = NamedFunction "Property", (config) ->

  config = {} unless config

  assertType config, Object, "config"

  if config.needsValue and (config.value is undefined)
    return null

  if isDev
    self =
      DEBUG: config.DEBUG is yes
      simple: yes
      writable: config.writable ?= yes
      enumerable: config.enumerable
      configurable: config.configurable ?= yes
  else
    self =
      simple: yes
      writable: yes
      enumerable: yes
      configurable: yes

  setType self, Property

  self._parseConfig config

  return self

module.exports = Property

Property::define = (target, key) ->

  { simple, enumerable } = this

  unless isDev
    enumerable = yes
  else
    enumerable = key[0] isnt "_" if enumerable is undefined
    simple = no unless enumerable

  if simple
    target[key] = @value
    return

  if isProto target
    @_defineProto target, key, enumerable
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
    set = @_makeEmptySetter key

  else if @get
    if @set then set = @set
    else set = @_makeEmptySetter key

  else if @lazy
    set = (newValue) ->
      value.set.call this, newValue

  else if @reactive
    set = (newValue) ->
      value.set newValue

  else
    set = (newValue) ->
      value = newValue

  if @DEBUG
    GLOBAL.DEFINED ?= []
    GLOBAL.DEFINED.push { value, get, set, enumerable, @configurable }

  descriptor = {
    get
    set: Setter this, getSafely or get, set
    enumerable
    @configurable
  }

  guard => Object.defineProperty target, key, descriptor
  .fail (error) => throwFailure error, { target, key, descriptor }

  return

Object.defineProperties Property.prototype,

  _makeEmptySetter: value: (key) ->
    if isDev then -> throw Error "'#{key}' is not writable."
    else emptyFunction

  _parseConfig: value: (config) ->

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

      if config.reactive
        assert @writable, "Reactive values must be writable!"
        @simple = no
        @reactive = yes

      @value = config.value

    if @writable

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

  _defineProto: value: (target, key, enumerable) ->

    if isDev

      if @lazy
        throw Error "Cannot define 'lazy' when the target is a prototype!"

      if @reactive
        throw Error "Cannot define 'reactive' when the target is a prototype!"

      if @willSet
        throw Error "Cannot define 'willSet' when the target is a prototype!"

      if @didSet
        throw Error "Cannot define 'didSet' when the target is a prototype!"

    { value, get, set, writable, configurable } = this

    if get
      set ?= @_makeEmptySetter key
      descriptor = { get, set, enumerable, configurable }

    else
      assert isDev, "This should never be used out of __DEV__ mode!"
      descriptor = { value, enumerable, writable, configurable }

    Object.defineProperty target, key, descriptor
    return
