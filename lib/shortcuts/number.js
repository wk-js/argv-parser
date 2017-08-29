module.exports = function(key, defaultValue) {
  this.set(key, {
    type: 'value',
    as: 'number',
    default: defaultValue,
    validate: function(num) {
      return !isNaN(num)
    }
  })
}