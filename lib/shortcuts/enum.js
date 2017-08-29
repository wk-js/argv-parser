'use strict'

module.exports = function(key, values, defaultValue) {
  const params = {
    values: values
  }

  if (defaultValue !== undefined) {
    params.defaultValue = defaultValue
  }

  this.set(key, params)
}