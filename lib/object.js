'use strict'

const { clone } = require('./utils/object')

class ARGObject {
  constructor() {
    this._arg_arr = []

    this.config       = {}
    this.params       = {}
    this.valid_params = {}
  }

  get arg_arr() {
    return this._arg_arr
  }

  set arg_arr(value) {
    this._arg_arr = value
  }

  get arg_str() {
    return this._arg_arr.join(' ')
  }

  clone() {
    const obj        = new ARGObject
    obj.arg_arr      = this.arg_arr.slice(0)
    obj.config       = clone(this.config)
    obj.params       = clone(this.params)
    obj.valid_params = clone(this.valid_params)
    return obj
  }

  validate() {}
}

module.exports = ARGObject