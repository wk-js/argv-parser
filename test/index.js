const ARGParser = require('../index')

const config = {
  who: {
    type: 'value',
    no_key: true,
    index: 2,
    defaultValue: 'John',
    description: 'Set who is talking'
  },

  message: {
    type: 'value',
    defaultValue: 'Hello World',
    description: 'Set message'
  },

  status: {
    type: 'enum',
    values: [ 'pending', 'draft', 'published' ],
    defaultValue: 'pending',
    description: 'Set status'
  },

  file: {
    type: 'file',
    extensions: [ '.txt', '.md' ],
    description: 'Set filename'
  },

  verbose: {
    type: 'boolean',
    aliases: [ 'v' ],
    defaultValue: false,
    description: 'Display logs'
  }
}

// const res0 = ARGParser.parse('wk hello')
// console.log(res0.valid_params)

// const res1 = ARGParser.parse('wk hello Max', config)
// console.log(res1.valid_params)

const res2 = ARGParser.parse('wk hello --message "Salut tout le monde"', config)
// console.log(res2.valid_params)

// const res3 = ARGParser.parse('wk hello --status something', config)
// console.log(res3.valid_params)

// const res4 = ARGParser.parse('wk hello --file hello.txt', config)
// console.log(res4.valid_params)

const res5 = ARGParser.parse('wk hello -v', config)
// console.log(res5.valid_params)

// console.log(ARGParser.join(res5.valid_params))
// console.log(ARGParser.format(res5, true))

// console.log(res5.valid_params)
// console.log(ARGParser.setParameters(res5, res2.params).valid_params)

ARGParser.contexts.push( 'wk', 'hello' )

const contexts = ARGParser.getContexts('wk --verbose hello --message "yolo"')

console.log(ARGParser.parse(contexts['wk']))
console.log(ARGParser.parse(contexts['hello'], config))