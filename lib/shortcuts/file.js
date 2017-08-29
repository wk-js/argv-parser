'use strict'

const fs          = require('fs')
const { extname } = require('path')

module.exports = function(key, extensions, defaultValue) {
  this.set(key, {
    type: 'value',
    default: defaultValue,
    validate: function(pth) {
      if (extensions && typeof pth === 'string' && extensions.indexOf(extname(pth)) === -1) {
        return false
      }

      try {
        fs.accessSync(pth, fs.constants.R_OK)
        return true
      } catch(e) {
        return false
      }
    },
    transform: function(pth) {
      return fs.readFileSync(pth, 'utf-8')
    }
  })
}