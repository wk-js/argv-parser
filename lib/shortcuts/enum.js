'use strict'

module.exports = function(key, values, defaultValue) {
  this.set(key, {
    values: values,
    default: defaultValue
  })
}