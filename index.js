'use strict'

const Parser    = require('./lib/parser')
const Command   = require('./lib/command')
const ARGObject = require('./lib/object')

const ParserSingleton = new Parser

ParserSingleton.new = (function() {
  return new Parser
}).bind(ParserSingleton)

ParserSingleton.command = (function(key) {
  const arg_command = new Command(key, this)
  return arg_command
}).bind(ParserSingleton)

ParserSingleton.Parser    = Parser
ParserSingleton.Command   = Command
ParserSingleton.ARGObject = ARGObject

module.exports = ParserSingleton