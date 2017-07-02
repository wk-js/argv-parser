'use strict'

const Parser  = require('./lib/parser')

const ParserSingleton = new Parser

ParserSingleton.checker('boolean', function( parameter, value ) {
  return typeof value === 'boolean'
})

ParserSingleton.checker('value', function( parameter, value ) {
  return value !== null && value !== undefined && value !== '' && typeof value !== 'boolean'
})

ParserSingleton.checker('select', function( parameter, value ) {
  console.log('"select" type is deprecated. Prefer "enum" type.')
  return ParserSingleton._checkers['enum']( parameter, value )
})

ParserSingleton.checker('enum', function( parameter, value ) {
  if (parameter.values && parameter.values.indexOf(value) === -1) {
    return false
  }
  return true
})

ParserSingleton.new = (function() {
  const parser     = new Parser(...arguments)
  parser._checkers = Object.assign({}, this._checkers)
  return parser
}).bind(ParserSingleton)

module.exports = ParserSingleton