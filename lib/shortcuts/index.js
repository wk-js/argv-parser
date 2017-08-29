'use strict'

const Shortcuts = {
  // Shortcuts
  alias:     require('./alias'),
  default:   require('./default'),
  describe:  require('./describe'),
  enum:      require('./enum'),
  file:      require('./file'),
  index:     require('./index_no_key'),
  required:  require('./required'),
  transform: require('./transform'),

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