'use strict'

module.exports = function(key, defaultValue) {
  this.set(key, {
    type: 'value',
    as: 'string',
    default: defaultValue,
    transform: function(str) {
      return str.split(',')
    }
  })
}