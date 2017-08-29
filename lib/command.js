'use strict'

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

  parse(strOrArr) {
    const res  = new Result
    res.config = this.config
    res.set( getParameters( strOrArr ) )

    const r = []

    for (let i = 0, k = 0, ilen = this._required.length; i < ilen; i++) {
      for (let j = 0, jlen = this._required[i].keys.length; j < jlen; j++) {
        if (!res.valid_params.hasOwnProperty(this._required[i].keys[j])) {
          r[k] = r[k] || {
            message: this._required[i].desc,
            missings: []
          }
          r[k].missings.push( this._required[i].keys[j] )
        }
      }

      k = r.length
    }

    if (r.length > 0) {
      return {
        errors: r,
        result: res
      }
    }

    return {
      result: res
    }
  }

}

module.exports = Command