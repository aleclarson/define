
scope = require "./scope"

mixin = module.exports = (closure) -> (target) ->
  target ?= scope.getTarget()
  scope.push target
  closure.call scope.define
  scope.pop()
  target
