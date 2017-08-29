'use strict'

const { pad }           = require('lol/utils/string')
const { clone, merge }  = require('lol/utils/object')
const { getParameters } = require('./utils')
const Shortcuts         = require('./shortcuts')
const Result            = require('./result')

class Command {

  constructor(key) {
    this.key    = key
    this.config = {}

    this._required = []

    Shortcuts(this)
  }

  clone() {
    const cmd     = new Command(this.key, this.parser)
    cmd.config    = clone(this.config)
    cmd._required = this._required.slice(0)
    return cmd
  }

  get(key) {
    if (!this.config.hasOwnProperty(key)) {
      this.config[key] = {}
    }

    return this.config[key]
  }

  set(key, params) {
    merge(this.get(key), params)
    return this
  }

  option(key, params) {
    this.set(key, merge({
      type: 'value',
      as: 'string'
    }, params))

    // Apply type
    const conf = this.get(key)
    if (conf && this[conf.type]) {
      this[conf.type].call(this, key)
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
    const res  = new Result
    res.config = this.config
    res.set( getParameters( strOrArr ) )

    const logs = []
    let error  = false

    for (let i = 0, ilen = this._required.length; i < ilen; i++) {
      if (!res.valid_params.hasOwnProperty(this._required[i].key)) {
        if (this._required[i].desc) {
          logs.push(`[Required] ${this._required[i].key} — ` + this._required[i].desc)
          error = true
        }
      }
    }

    if (error) {
      console.log(logs.join('\n'))
      if (exit) process.exit(1)
      return null
    }

    return res
  }

}

module.exports = Command