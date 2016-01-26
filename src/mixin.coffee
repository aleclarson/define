
scope = require "./scope"

mixin = module.exports = (closure) -> () ->
  target = scope.getTarget()
  scope.push target
  Array::unshift.call arguments, this
  closure.apply scope.define, arguments
  scope.pop()
  return
