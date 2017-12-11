'use strict'

const list = require('./list')

module.exports = function(key, defaultValue, no_legacy) {

  if (!no_legacy) {
    list( key, defaultValue, ',' )
    return
  }

  this.set(key, {
    type: 'value',
    as: 'string',
    default: Array.isArray(defaultValue) ? defaultValue : [ defaultValue ],
    transform: function(str) {
      return Array.isArray(str) ? str : [ str ]
    }
  })

}