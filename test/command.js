'use strict'

const { Parser } = require('../index')

const command = Parser
.command('hello')

// .index('who', 1)
// .default('who', 'John')
// .describe('who', 'Who is talking ?')
// ==> Same as
.option('who', {
  no_key: true,
  index: 1,
  default: 'John',
  description: 'Who is talking ?'
})

// .string('message')
// .coerce('message', function(v) {
//   return v === "Salut" ? "Plop" : v
// })
// ==> Same as
.option('message', {
  as: 'string',
  coerce(v) {
    return v === "Salut" ? "Plop" : v
  }
})

// .file('package', [ '.json' ])
// .alias('package', 'p')
// ==> Same as
.option('package', {
  type: 'file',
  aliases: [ 'p' ]
})

.array('anything', '', true)
.alias('anything', [ 'a' ])

.required(['who', 'message'], 'veuillez préciser un message')

.help()

const res = command.parse('hello Fred --message "Salut" -p package.json -a lol -a flol')
console.log(res.result.params)

// console.log(ARGParser.getContextArgv(ARGParser.split('hello Fred --message "Salut" -p package.json'), command.config))
