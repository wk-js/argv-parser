'use strict'

const fs        = require('fs')
const { merge } = require('./utils/object')
const pad       = require('./utils/string').pad

class ARGCommand {
  constructor(key, parser) {
    this.key    = key
    this.parser = parser
    this.config = {}

    this._required = []
  }

  get(key) {
    if (!this.config.hasOwnProperty(key)) {
      this.config[key] = {}
    }

    return this.config[key]
  }

  set(key, params, o) {
    merge(this.get(key), params, o)
  }

  option(key, params) {
    this.set(key, merge({
      type: 'value',
      as: 'string'
    }, params))

    // Apply type
    const conf = this.get(key)
    if (conf && this[conf.type]) {
      this[conf.type](key)
    }

    return this
  }

  describe(key, desc) {
    this.set(key, {
      description: desc
    })

    return this
  }

  default(key, value) {
    this.set(key, {
      defaultValue: value
    })

    return this
  }

  alias() {
    const args = Array.prototype.slice.call(arguments)
    const key  = args.shift()

    this.set(key, {
      aliases: args
    })

    return this
  }

  /**
   * Types
   */

  boolean(key) {
    this.set(key, {
      type: 'boolean',
      as: 'boolean'
    })

    return this
  }

  select() {
    const args = Array.prototype.slice.call(arguments)
    const key  = args.shift()

    this.set(key, {
      values: args
    })

    return this
  }

  index(key, index) {
    this.set(key, {
      no_key: true,
      index: index
    })

    return this
  }

  string(key) {
    this.set(key, {
      type: 'value',
      as: 'string'
    })

    return this
  }

  number(key) {
    this.set(key, {
      type: 'value',
      as: 'number'
    })

    return this
  }

  file(key) {
    this.set(key, {
      type: 'value',
      coerce: function(pth) {
        return fs.readFileSync(pth, 'utf-8')
      }
    })

    return this
  }

  required(keys, desc) {

    keys = Array.isArray(keys) ? keys : [ keys ]

    keys.forEach((key) => {
      this.set(key, {
        required: true
      })

      this._required.push({ key: key, desc: desc })
    })

    return this
  }

  coerce(key, fn) {
    this.set(key, {
      coerce: fn
    })

    return this
  }

  help() {
    this.config['help'] = {
      type: 'boolean',
      as: 'boolean',
      defaultValue: false,
      aliases: [ 'h' ],
      description: this.getHelp()
    }

    return this
  }

  getHelp() {
    const config = this.config

    const p = []

    let str = null, param = null
    for (const key in config) {

      param = config[key]
      str = ''

      if (!param.aliases) {
        param.aliases = [ key ]
      } else {
        param.aliases.unshift( key )
      }

      for (const i in param.aliases) {
        if (param.aliases[i].length === 1) {
          str += ' -' + param.aliases[i]
        } else {
          str += ' --' + param.aliases[i]
        }
      }

      if (param.type === 'select') {
        const s = param.values.join('|')
        str += ` (${s})`
      } else if (param.type === 'value') {
        str += ` <string>`
      }

      str = '  ' + pad(str, 40, ' ', true)
      str = str + ' ' + (param.description || '-') + ''

      p.push( str )
    }

    return p.join('\n')
  }

  parse(strOrArr, exit) {
    const res = this.parser.parse(strOrArr, this.config)

    for (let i = 0, ilen = this._required.length; i < ilen; i++) {
      if (!res.valid_params.hasOwnProperty(this._required[i].key)) {
        if (this._required[i].desc) console.log(this._required[i].desc)
        if (exit) process.exit(1)
        return null
      }
    }

    return res
  }
}

module.exports = ARGCommand