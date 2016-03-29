
{ assertType } = require "type-utils"

module.exports =
Setter = (prop, get, set) ->

  assertType get, Function
  assertType set, Function

  needsGet = set.length > 1
  setter = set

  if prop.willSet

    unless needsGet
      needsGet = prop.willSet.length > 1

    if prop.didSet

      unless needsGet
        needsGet = prop.didSet.length > 1

      setter = (newValue, oldValue) ->
        newValue = prop.willSet.call this, newValue, oldValue
        set.call this, newValue, oldValue
        prop.didSet.call this, newValue, oldValue

    else
      setter = (newValue, oldValue) ->
        newValue = prop.willSet.call this, newValue, oldValue
        set.call this, newValue, oldValue

  else if prop.didSet

    unless needsGet
      needsGet = prop.didSet.length > 1

    setter = (newValue, oldValue) ->
      set.call this, newValue, oldValue
      prop.didSet.call this, newValue, oldValue

  if needsGet then (newValue) ->
    setter.call this, newValue, get.call this

  else (newValue) ->
    setter.call this, newValue
