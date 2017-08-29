'use strict'

module.exports = function(key, index) {
  this.set(key, {
    no_key: true,
    index: index
  })
}