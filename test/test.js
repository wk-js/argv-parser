'use strict'

const { Parser } = require('../index')

const cmd = Parser.command('task')

.string('who')
.default('who', 'John')
.index('who', 1)

.string('message')

.file('package', [ '.json' ], 'package.json')

.enum('status', [ 'pending', 'complete', 'fail' ], 'pending')

.string('username')
.string('password')

.required([ 'username', 'password' ], 'Need username and password')
.required([ 'message' ], 'Set a message')

// console.log(cmd.config)

const res = cmd.parse('wk')

// Error when required not resolved
if (res.errors) {
  console.log(res.errors)
} else {
  console.log(res.result.params)
}