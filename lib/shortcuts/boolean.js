'use strict'

module.exports = function(key, defaultValue) {
  this.set(key, {
    type: 'boolean',
    as: 'boolean',
    default: defaultValue
  })
}