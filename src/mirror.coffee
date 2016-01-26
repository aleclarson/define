
define = require "./define"

mirror = module.exports = (obj, options) ->

  options = {} unless options? and options.constructor is Object

  if options.include instanceof Array
    included = {}
    included[key] = yes for key in options.include

  else
    options.exclude = [] unless options.exclude instanceof Array
    excluded = {}
    excluded[key] = yes for key in options.exclude

  for key of obj
    continue unless (included? and included[key]?) or !excluded[key]?
    if obj[key] instanceof Function then define key, value: obj[key].bind obj
    else defineGetSet obj, key

defineGetSet = (obj, key) ->
  define key,
    get: -> obj[key]
    set: (newValue) -> obj[key] = newValue
