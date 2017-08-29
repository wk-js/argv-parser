'use strict'

const { getParameters } = require('./utils')
const Result  = require('./result')
const Command = require('./command')

class Parser {

  static parse(strOrArray, config) {
    const result = new Result

    if (config) result.config = config

    result.set( getParameters( strOrArray ) )

    return result
  }

  static command(key) {
    return new Command(key)
  }

}

module.exports = Parser