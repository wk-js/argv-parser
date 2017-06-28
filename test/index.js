'use strict'

const assert    = require('assert')
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

describe('basic', function() {

  it('parse', function() {
    const res = ARGParser.parse('wk hello')
    assert.equal(res.arg_str, 'wk hello')
    assert.deepEqual(res.arg_arr, [ 'wk', 'hello' ])
    assert.deepEqual(res.params, { _: [ 'wk', 'hello' ] })
  })

  it('valid parse', function() {
    const res = ARGParser.parse('wk hello Max', config)
    assert.deepEqual(res.valid_params, {
      who: 'Max',
      message: 'Hello World',
      status: 'pending',
      verbose: false
    })
  })

  it('valid parse 2', function() {
    const res = ARGParser.parse('wk hello --message "Salut tout le monde" --status something --file hello.txt -v', config)

    assert.deepEqual(res.valid_params, {
      who: 'John',
      file: 'hello.txt',
      message: 'Salut tout le monde',
      status: 'pending',
      verbose: true
    })

    assert.equal(ARGParser.format(res, true), 'wk hello --who=John --message=Salut tout le monde --status=pending --file=hello.txt --verbose=true')
  })

  it('contexts', function() {
    const parser = ARGParser.new()

    parser.contexts.push( 'wk' )
    parser.contexts.push( /hello/ )
    parser.contexts.push(function(str) {
      const arr = [ 'world' ]
      const regex = new RegExp(`(${arr.join('|')})`, 'g')
      return str.match(regex)
    })

    const contexts = parser.getContexts('wk --verbose hello --message "yolo" world --message "polo"')

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
    const res = ARGParser.parse('wk --message "Hello World" --verbose', config)

    // Test parameters before
    assert.deepEqual(res.valid_params, {
      who: 'John',
      message: 'Hello World',
      status: 'pending',
      verbose: true
    })

    // Override parameters
    ARGParser.setParameters(res, {
      message: "Salut tout le monde",
      status: 'draft',
      verbose: false
    })

    // Test parameters after
    assert.deepEqual(res.valid_params, {
      who: 'John',
      message: 'Salut tout le monde',
      status: 'draft',
      verbose: false
    })
  })
})