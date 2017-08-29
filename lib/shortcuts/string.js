'use strict'

module.exports = function(key, defaultValue) {
  const params = {
    type: 'value',
    as: 'string'
  }

  if (defaultValue !== undefined) {
    params.defaultValue = defaultValue
  }

  this.set(key, params)
}