'use strict'

const { clone, merge } = require('lol/utils/object')
const { toArray, getValidParameters } = require('./utils')

class Result {

  constructor() {
    this.soft_params  = { _: [] }
    this.valid_params = {}

    this.config = null
  }

  get strict() {
    return !!this.config
  }

  get type() {
    return this.strict ? 'valid' : 'soft'
  }

  get params() {
    return this.strict ? this.valid_params : this.soft_params
  }

  toArray() {
    return toArray(this.params, true)
  }

  toString() {
    return this.toArray().join(' ')
  }

  clone() {
    const result = new Result

    result.soft_params = clone(this.soft_params)

    if (this.config) {
      result.config       = clone(this.config)
      result.valid_params = clone(this.valid_params)
    }

    return result
  }

  get(type) {
    if (!type || !this[type + '_params']) return this.params
    return this[type + '_params']
  }

  set(params) {
    if (typeof params === 'string') {
      this.soft_params._.push( params )
      return
    }

    merge(this.soft_params, params)
    this.validate()
  }

  validate() {
    this.valid_params = getValidParameters( this.soft_params, this.config )
  }

}

module.exports = Result