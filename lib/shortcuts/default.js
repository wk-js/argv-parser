'use strict'

module.exports = function(key, value) {
  this.set(key, {
    defaultValue: value
  })
}