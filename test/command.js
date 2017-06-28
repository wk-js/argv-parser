'use strict'

const ARGParser = require('../index')

const command = ARGParser
.command('hello')

.index('who', 1)
.default('who', 'John')
.describe('who', 'Who is talking ?')

.string('message')
.required(['who', 'message'], 'veuillez préciser un message')
.coerce('message', function(v) {
  return v === "Salut" ? "Plop" : v
})

.file('package', [ '.json' ])
.alias('package', 'p')

.help()

const res = command.parse('hello Fred --message "Salut" -p package.json')
console.log(res)