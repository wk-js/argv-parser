'use strict'

const fs          = require('fs')
const { extname } = require('path')

module.exports = function(key, extensions) {
  this.set(key, {
    type: 'value',
    validate: function(pth) {
      if (extensions && typeof pth === 'string' && extensions.indexOf(extname(pth)) === -1) {
        return false
      }

      return true
    },
    transform: function(pth) {
      return fs.readFileSync(pth, 'utf-8')
    }
  })
}