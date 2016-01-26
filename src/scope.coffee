
module.exports =

  current: 0

  cache: [target: null, options: null]

  push: (target) ->
    options = {}
    merge options, @getOptions()
    @cache.push { target, options }
    @current++

  pop: ->
    @current--
    @cache.pop()

  call: (callback) ->
    @push @target
    callback.call @define
    @pop()
    return

  createOptions: (userOptions) ->
    options = {}
    merge options, @getOptions()
    merge options, userOptions
    options

  getOptions: ->
    @cache[@current].options

  getTarget: ->
    @cache[@current].target

#
# Helpers
#

merge = (target, source) ->
  return unless source?.constructor is Object
  target[key] = value for key, value of source
