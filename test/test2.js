const { Parser } = require('../index')

console.log(Parser.parse('NODE_ENV=production llo=lloo wk --verbose lol').params)