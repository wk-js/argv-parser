'use strict'

const { clone, merge } = require('./utils/object')

class ARGObject {
  constructor(parser) {
    this.parser = parser

    this.soft_params  = { _: [] }
    this.valid_params = {}

    this.config = null
  }

  get type() {
    return this.config ? 'valid' : 'soft'
  }

  get params() {
    return this.config ? this.valid_params : this.soft_params
  }

  toArray() {
    return this.parser.getClass().toArray(this.params, true)
  }

  toString() {
    return this.toArray().join(' ')
  }

  clone() {
    const obj = new ARGObject(this.parser)

    obj.arg_arr = this.arg_arr.slice(0)
    obj.params  = clone(this.soft_params)

    if (this.config) {
      obj.config       = clone(this.config)
      obj.valid_params = clone(this.valid_params)
    }

    return obj
  }

  get(type) {
    if (!type) return this.params
    return this[type + '_params']
  }

  set(params) {
    if (typeof params === 'string') {
      this.soft_params._.push( params )
      return
    }

    merge( this.soft_params, params )
    this.validate()
  }

  validate() {
    if (this.config) {
      this.valid_params = this.parser.getValidParameters( this.soft_params, this.config )
    }
  }
}

module.exports = ARGObject