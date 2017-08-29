module.exports = function(key, defaultValue) {
  const params = {
    type: 'value',
    as: 'number'
  }

  if (defaultValue !== undefined) {
    params.defaultValue = defaultValue
  }

  this.set(key, params)
}