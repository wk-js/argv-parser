'use strict'

module.exports = function(key, defaultValue) {
  const params = {
    type: 'boolean',
    as: 'boolean'
  }

  if (defaultValue !== undefined) {
    params.defaultValue = defaultValue
  }

  this.set(key, params)

}