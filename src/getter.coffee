
ReactiveVar = require "reactive-var"
LazyVar = require "lazy-var"

module.exports =
Getter = (prop) ->
  return getType(prop)(prop)

getType = (prop) ->
  return SimpleGetter if prop.get
  throw Error "'set' cannot be defined without 'get'!" if prop.set
  return LazyGetter if prop.lazy
  return ReactiveGetter if prop.reactive
  return ValueGetter

SimpleGetter = (prop) ->
  prop.writable = prop.set isnt undefined
  return -> prop.get.call this

LazyGetter = (prop) ->
  prop.value = LazyVar
    initValue: prop.lazy
    reactive: prop.reactive
  if prop.writable is yes
    prop.set = (newValue) ->
      prop.value.set.call this, newValue
  else prop.set = undefined
  prop.lazy = undefined
  return -> prop.value.get.call this

ReactiveGetter = (prop) ->
  prop.writable = yes
  prop.value = new ReactiveVar prop.value
  prop.set = (newValue) ->
    prop.value.set newValue
  return -> prop.value.get()

ValueGetter = (prop) ->
  prop.set = (newValue) ->
    prop.value = newValue
  return -> prop.value
