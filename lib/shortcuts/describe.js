'use strict'

module.exports = function(key, desc) {
  this.set(key, {
    description: desc
  })
}