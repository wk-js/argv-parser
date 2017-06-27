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
    parser.contexts.push( 'wk', 'hello' )

    const contexts = parser.getContexts('wk --verbose hello --message "yolo"')

    assert.deepEqual(parser.parse(contexts['hello'], config).valid_params, {
      who: 'John',
      message: 'yolo',
      status: 'pending',
      verbose: false
    })
  })
})