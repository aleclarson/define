
emptyFunction = require "emptyFunction"
isDev = require "isDev"

module.exports =
Setter = (prop) ->
  return EmptySetter unless prop.writable
  setter = getType(prop)(prop)
  return (newValue) ->
    setter.call this, newValue, prop.getter.call this

getType = (prop) ->
  if prop.willSet
    if prop.didSet
      WillDidSetter
    else WillSetter
  else if prop.didSet
    DidSetter
  else SimpleSetter

SimpleSetter = (prop) -> (newValue, oldValue) ->
  prop.set.call this, newValue, oldValue

EmptySetter = (prop) ->
  prop.willSet = prop.set = prop.didSet = undefined
  return emptyFunction unless isDev
  return -> throw Error "'#{prop.key}' is not writable."

WillSetter = (prop) -> (newValue, oldValue) ->
  newValue = prop.willSet.call this, newValue, oldValue
  prop.set.call this, newValue, oldValue

DidSetter = (prop) -> (newValue, oldValue) ->
  prop.set.call this, newValue, oldValue
  prop.didSet.call this, newValue, oldValue

WillDidSetter = (prop) -> (newValue, oldValue) ->
  newValue = prop.willSet.call this, newValue, oldValue
  prop.set.call this, newValue, oldValue
  prop.didSet.call this, newValue, oldValue
