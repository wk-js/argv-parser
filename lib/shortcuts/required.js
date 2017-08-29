'use strict'

module.exports = function(keys, desc) {

  keys = Array.isArray(keys) ? keys : [ keys ]

  keys.forEach((key) => {
    this.set(key, {
      required: true
    })

    this._required.push({ key: key, desc: desc })
  })

}