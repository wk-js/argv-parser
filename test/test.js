'use strict'

const Parser = require('../index')

const cmd = 'wk hello --world plouf --mf --surprise'

const res = Parser.parse(cmd)

console.log(cmd)
console.log(Parser.join(res.params, true))