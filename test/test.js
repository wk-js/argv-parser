'use strict'

const { Parser, Command, Result } = require('../index')

// const cmd = 'wk --verbose hello --world plouf --mf --surprise'

// const parser = new Parser
// const res    = parser.parse(cmd)

// console.log(cmd)
// console.log(res.params)
// console.log(res.toString())
// console.log(res.toArray())
// res.set({
//   mf: false,
//   world: 'yolo'
// })
// console.log(res.toString())
// console.log(res.toArray())

// // My Task
// const argv  = new Result(parser)
// // const cmmnd = new Command('task', parser)

// // cmmnd.option('who', {})
// // cmmnd.option('message', {})

// argv.set('task')
// argv.set({
//   who: 'John',
//   message: 'Salut Max !'
// })

// // argv.config = cmmnd.config
// argv.validate()

// console.log(argv.params)

const cmd = Parser.command('task')

// .option('who', {
//   defaultValue: 'John'
// })

// .option('message', {
//   defaultValue: 'Hello'
// })


.string('who')
.default('who', 'John')
.index('who', 1)

.string('message')

.file('package', [ '.json' ])
.default('package', 'package.json')

.enum('status', [ 'pending', 'complete', 'fail' ], 'pending')

.string('username')
.string('password')

.required([ 'username', 'password' ], 'Need username and password')
.required([ 'message' ], 'Set a message')

const res = cmd.parse('wk')
if (res) console.log(res.params)