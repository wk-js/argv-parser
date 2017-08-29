'use strict'

module.exports = function() {
  this.set('help', {
    type: 'boolean',
    as: 'boolean',
    defaultValue: false,
    aliases: [ 'h' ],
    description: this.getHelp()
  })
}