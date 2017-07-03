'use strict'

const { Parser, Command, ARGObject } = require('../index')
const parser = new Parser

const cmd = 'wk --verbose hello --world plouf --mf --surprise'

const res = parser.parse(cmd)

// console.log(cmd)
// console.log(res.params)
// console.log(res.toString())
// res.set({
//   mf: false,
//   world: 'yolo'
// })
// console.log(res.toString())
// console.log(res.toArray())

// My Task
const argv  = new ARGObject(parser)
const cmmnd = new Command('task', parser)

cmmnd.option('who', {})
cmmnd.option('message', {})

argv.set('task')
argv.set({
  who: 'John',
  message: 'Salut Max !'
})

argv.config = cmmnd.config
argv.validate()

console.log(argv.params)

