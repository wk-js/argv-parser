'use strict'

module.exports = function(key, fn) {
  this.set(key, {
    transform: fn
  })
}