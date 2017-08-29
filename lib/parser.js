'use strict'

const { getParameters, getContexts } = require('./utils')
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

  static contexts(strOrArray, contexts) {
    return getContexts(strOrArray, contexts)
  }

}

module.exports = Parser