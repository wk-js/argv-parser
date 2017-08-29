'use strict'

module.exports = function(key, aliases) {
  this.set(key, {
    aliases: aliases
  })
}