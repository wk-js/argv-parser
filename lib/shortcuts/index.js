'use strict'

const Shortcuts = {
  // Shortcuts
  alias:     require('./alias'),
  array:     require('./object'),
  default:   require('./default'),
  describe:  require('./describe'),
  enum:      require('./enum'),
  file:      require('./file'),
  help:      require('./help'),
  index:     require('./index_no_key'),
  object:    require('./object'),
  required:  require('./required'),
  transform: require('./transform'),
  validate:  require('./validate'),

  // Types
  boolean: require('./boolean'),
  number:  require('./number'),
  string:  require('./string')
}

module.exports = function(obj) {
  for (const key in Shortcuts) {
    obj[key] = function() {
      Shortcuts[key].apply(obj, arguments)
      return obj
    }
  }
}