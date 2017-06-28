'use strict'

const ARGParser = require('../index')

const command = ARGParser
.command('hello')
.option('who', {
  no_key: true,
  index: 1,
  defaultValue: 'John',
  description: 'Set who is talking'
})
.help()

console.log(command.parse('hello Fred --message "world"'))