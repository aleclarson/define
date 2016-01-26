
Property = require "./property"
inArray = require "in-array"
scope = require "./scope"

define = module.exports = (target, data) ->

  unless isTargetValid target
    global.failure ?= { value: target, isValid: isTargetValid }
    error = TypeError "'target' has an unexpected type: '#{target?.constructor}'"
    error.code = "BAD_TARGET_TYPE"
    throw error

  ctr = target.constructor

  if arguments.hasOwnProperty 1
    return Property target, data if ctr is String

  else
    return Property target if (ctr is String) or (ctr is Object)
    return scope.call target if ctr is Function

  unless isDataValid data
    global.failure ?= { value: data, isValid: isDataValid }
    error = TypeError "'data' has an unexpected type: '#{data?.constructor}'"
    error.code = "BAD_DATA_TYPE"
    throw error

  scope.push target

  ctr = data.constructor

  if ctr is Function
    data.call scope.define

  else if ctr is Object
    Property data

  else if ctr is String
    Property data, arguments[2]

  scope.pop()

  target

isDataValid = (value) ->
  value? and inArray [ String, Object, Function ], value.constructor

isTargetValid = (value) ->
  value? and (
    (value.constructor is String) or
    (value.constructor is undefined) or
    (value.constructor instanceof Object)
  )
