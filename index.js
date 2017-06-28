'use strict'

const path      = require('path')
const ARGParser = require('./lib/arg-parser2')

const ARGParserSingleton = new ARGParser

ARGParserSingleton.checker('boolean', function( parameter, value ) {
  return typeof value === 'boolean'
})

ARGParserSingleton.checker('value', function( parameter, value ) {
  return value !== null && value !== undefined && value !== '' && typeof value !== 'boolean'
})

ARGParserSingleton.checker('select', function( parameter, value ) {
  console.log('"select" type is deprecated. Prefer "enum" type.')
  return ARGParserSingleton._checkers['enum']( parameter, value )
})

ARGParserSingleton.checker('enum', function( parameter, value ) {
  if (parameter.values && parameter.values.indexOf(value) === -1) {
    return false
  }
  return true
})

// ARGParserSingleton.checker('file', function( parameter, value ) {
//   let res = false
//   let ext = ''

//   if (ARGParserSingleton._checkers['value'](parameter, value)) {
//     ext = path.extname(value)
//     res = ext.length > 1
//   }

//   if (parameter.extensions) {
//     res = parameter.extensions.indexOf(ext) !== -1
//   }

//   return res
// })

ARGParserSingleton.new = (function() {
  const parser     = new ARGParser(...arguments)
  parser._checkers = Object.assign({}, this._checkers)
  return parser
}).bind(ARGParserSingleton)

module.exports = ARGParserSingleton