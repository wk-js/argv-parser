'use strict'

const assert    = require('assert')
const ARGParser = require('../index')

const config = {
  who: {
    type: 'value',
    no_key: true,
    index: 1,
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

describe('basic', function() {

  it('parse', function() {
    const res = ARGParser.parse('wk hello')
    assert.equal(res.toString(), 'wk hello')
    assert.deepEqual(res.toArray(), [ 'wk', 'hello' ])
    assert.deepEqual(res.params, { _: [ 'wk', 'hello' ] })
  })

  it('valid parse', function() {
    const res = ARGParser.parse('hello Max', config)

    assert.deepEqual(res.params, {
      who: 'Max',
      message: 'Hello World',
      status: 'pending',
      verbose: false,
      _: [ 'hello' ]
    })
  })

  it('valid parse 2', function() {
    const res = ARGParser.parse('hello --message "Salut tout le monde" --status something --file hello.txt -v', config)

    assert.deepEqual(res.params, {
      who: 'John',
      file: 'hello.txt',
      message: 'Salut tout le monde',
      status: 'pending',
      verbose: true,
      _: [ 'hello' ]
    })

    assert.equal(res.toString(), 'hello --who="John" --message="Salut tout le monde" --status="pending" --file="hello.txt" --verbose')
  })

  it('contexts', function() {
    const parser = ARGParser.new()

    const conditions = []

    conditions.push( 'wk' )
    conditions.push( /hello/ )
    conditions.push(function(str) {
      const arr = [ 'world' ]
      const regex = new RegExp(`(${arr.join('|')})`, 'g')
      return str.match(regex)
    })

    const cmd      = 'wk --verbose hello --message "yolo" world --message "polo"'
    const contexts = parser.getContexts(cmd, conditions)

    assert.deepEqual(parser.parse(contexts['hello']).params, {
      _: [ 'hello' ],
      message: 'yolo'
    })

    assert.deepEqual(parser.parse(contexts['world']).params, {
      _: [ 'world' ],
      message: 'polo'
    })
  })

  it('override parameters', function() {
    const res = ARGParser.parse('hello --message "Hello World" --verbose', config)

    // Test parameters before
    assert.deepEqual(res.params, {
      who: 'John',
      message: 'Hello World',
      status: 'pending',
      verbose: true,
      _: [ 'hello' ]
    })

    // Override parameters
    res.set({
      message: "Salut tout le monde",
      status: 'draft',
      verbose: false,
      _: [ 'hello' ]
    })

    // Test parameters after
    assert.deepEqual(res.params, {
      who: 'John',
      message: 'Salut tout le monde',
      status: 'draft',
      verbose: false,
      _: [ 'hello' ]
    })
  })
})