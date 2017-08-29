# ARGParser

Parser for `process.argv`

## Parser

```js
const { Parser } = require('argv-parser')
const result = Parser.parse('wk --who John --message "Hello World"')
console.log(result.params) //# => { _: [ 'wk' ], who: 'John', message: 'Hello World' }
```

Use a configuration

```js
const { Parser } = require('argv-parser')

const config = {
  who: {
    default: 'John'
  },

  message: {
    default: 'Hello World'
  }
}

const result0 = Parser.parse('wk')
console.log(result0.params) //# => { _: [ 'wk' ] }

const result1 = Parser.parse('wk', config)
console.log(result1.params) //# => { _: [ 'wk' ], who: 'John', message: 'Hello World' }
```

Split argv to contexts

```js
const { Parser } = require('argv-parser')

const conditions = []
conditions.push('wk')            // string
conditions.push( /hello/ )       // or regexp
conditions.push(function(str) {  // or function
  const arr = [ 'world' ]
  const regex = new RegExp(`(${arr.join('|')})`, 'g')
  return str.match(regex)
})

const cmd = 'wk --verbose hello --message "yolo" world --message "polo"'
const contexts = Parser.contexts(cmd, conditions)

console.log(contexts['wk'])    //# => [ 'wk', '--verbose' ]
console.log(contexts['hello']) //# => [ 'hello', '--message', 'yolo' ]
console.log(contexts['world']) //# => [ 'world', '--message', 'polo' ]
```

Use `command` wrapper to create configuration

```js

const packageExtensions = [ '.json' ]

const command = Parser.command('wk')

.option('who', {
  default: 'John',
  no_key: true,
  index: 1
})

.option('message', {
  default: 'Hello World'
})

.option('package', {
  validate: function(pth) {
    if (packageExtensions && typeof pth === 'string' && packageExtensions.indexOf(extname(pth)) === -1) {
      return false
    }

    return true
  },
  transform: function(pth) {
    return fs.readFileSync(pth, 'utf-8')
  },
  default: 'package.json'
})

.option('status', {
  type: 'enum',
  values: [ 'pending', 'complete', 'fail' ],
  default: 'pending'
})

.option('username', {})

.option('password', {})

.required([ 'username', 'password' ], 'Need username and password')
.required([ 'message' ], 'Set a message')

console.log(command.config)

/**
  * Print result:

    {
      who: {
        type: 'value',
        as: 'string',
        default: 'John',
        no_key: true,
        index: 1
      },

      message: {
        type: 'value',
        as: 'string',
        required: true
      },

      package: {
        type: 'value',
        validate: [Function: validate],
        transform: [Function: transform],
        default: 'package.json'
      },

      status: {
        values: [ 'pending', 'complete', 'fail' ],
        default: 'pending'
      },

      username: {
        type: 'value',
        as: 'string',
        required: true
      },

      password: {
        type: 'value',
        as: 'string',
        required: true
      }
    }
 */

const res = cmd.parse('wk')

// Error when required not resolved
if (res.errors) {
  console.log(res.errors)
} else {
  console.log(res.result.params)
}
```

Equivalent with shortcuts

```js
const command = Parser.command('wk')

.default('who', 'John')
.index('who', 1)

.string('message', 'Hello World')

.file('package', [ '.json' ], 'package.json')

.enum('status', [ 'pending', 'complete', 'fail' ], 'pending')

.string('username')
.string('password')

.required([ 'username', 'password' ], 'Need username and password')

const res = cmd.parse('wk')

// Error when required not resolved
if (res.errors) {
  console.log(res.errors)
} else {
  console.log(res.result.params)
}
```