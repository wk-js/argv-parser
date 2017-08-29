'use strict'

module.exports = function(key, defaultValue) {
  this.set(key, {
    default: defaultValue
  })
}