'use strict'

module.exports = function(key, defaultValue) {
  this.set(key, {
    type: 'value',
    as: 'string',
    default: defaultValue
  })
}