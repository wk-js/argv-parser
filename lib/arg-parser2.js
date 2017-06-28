'use strict'

const ARGObject = require('./arg-object')
const { clone, merge } = require('./utils/object')

const cleanVariable = function(str) {
  return str.replace(/^-*/, '')
}

const cleanProperty = function(str) {
  if (typeof str === 'string') {
    if (str === 'true')  return true
    if (str === 'false') return false
    if (!isNaN(Number(str))) return Number(str)
  }

  return str
}

class Parser {

  constructor() {
    this.contexts  = []
    this._checkers = {}
  }

  checker(name, checkFn) {
    if (!name || !checkFn) {
      console.warn('No name or check function found')
      return
    }

    this._checkers[name] = checkFn
  }

  parse( strOrArr, config ) {

    const arg_str = typeof strOrArr === 'string' ? strOrArr : strOrArr.join(' ')
    const arg_arr = Array.isArray(strOrArr) ? strOrArr.slice(0) : Parser.split(strOrArr)

    const obj = new ARGObject

    obj.arg_str = arg_str
    obj.arg_arr = arg_arr

    obj.config       = clone(config) || {}
    obj.params       = Parser.getParameters( obj.arg_arr )
    obj.valid_params = Parser.getValidParameters( obj.params, obj.config, this._checkers )

    return obj
  }

  split( str ) {
    return Parser.split( str )
  }

  join( obj ) {
    return Parser.join( obj )
  }

  format( argobj, valid ) {
    let arr = argobj.params._.slice(0)

    if (!valid) {
      const params = clone(argobj.params)
      delete params._

      arr = arr.concat(this.split(this.join(params)))
    } else {
      arr = arr.concat(this.split(this.join(argobj.valid_params)))
    }

    return arr.join(' ')
  }

  setParameters(arg_object, params) {
    merge( arg_object.params, params )
    arg_object.valid_params = Parser.getValidParameters( arg_object.params, arg_object.config, this._checkers )
    return arg_object
  }

  getContexts( strOrArr ) {

    const arg_str = typeof strOrArr === 'string' ? strOrArr : strOrArr.join(' ')
    const arg_arr = Array.isArray(strOrArr) ? strOrArr.slice(0): Parser.split(strOrArr)
    const ctxs    = {}

    let index      = -1,
         ilen      = this.contexts.length,
         prevIndex = -1,
                 i = 0

    let key, match

    const order = []

    for (i = 0, key; i < ilen; i++) {
      const resolver = this.contexts[i]

      if (typeof resolver === 'string') {
        match = arg_str.match(new RegExp(`(${resolver})`))
      } else if (resolver instanceof RegExp) {
        match = arg_str.match(resolver)
      } else if (typeof resolver === 'function') {
        match = resolver(arg_str)
      }

      if (match) {
        for (let j = 0, jlen = match.length; j < jlen; j++) {
          index = arg_arr.indexOf(match[j])
          key   = match[j]

          if (index !== -1) {
            if (index < prevIndex) order.unshift({ key: key, index: index })
            else order.push({ key: key, index: index })

            prevIndex = index
          }
        }
      }

    }

    ilen = order.length

    for (i = 0, key; i < ilen; i++) {
      if (order[i+1]) {
        ctxs[order[i].key] = arg_arr.slice(order[i].index, order[i+1].index)
      } else {
        ctxs[order[i].key] = arg_arr.slice(order[i].index, arg_arr.length)
      }
    }

    return ctxs

  }

}

/**
 * Static
 */
 Parser.split = function(str) {

  const quotes = str.match(/(["'`])(?:(?=(\\?))\2.)*?\1/g) || []

  let i = 0, index = -1
  const ilen = quotes.length

  for (i = 0; i < ilen; i++) {
    str = str.replace(quotes[i], '$'+i)
  }

  const split = str.split(' ')

  for (i = 0; i < ilen; i++) {
    for (let j = 0, jlen = split.length; j < jlen; j++) {
      index = split[j].indexOf('$'+i)
      if (index !== -1) {
        split[j] = split[j].slice(0, index) + quotes[i].slice(1, quotes[i].length-1)
        break
      }
    }
  }

  return split

}

Parser.join = function( obj ) {
  const arr = []
  let str = ''

  for (const key in obj) {
    if (key.length === 1) {
      str = `-${key}`
    } else {
      str = `--${key}`
    }

    str += `="${obj[key]}"`

    arr.push( str )
  }

  return arr.join(' ')
}

Parser.getParameters = function(parameters) {
  const object = { _: [] }

  if (parameters.length === 0) return object

  const params        = parameters
  const matchVarRegex = /^-{1}\w|^-{2}\w/

  let str, key, value

  for (let i = 0, len = params.length; i <= len; i++) {

    str = params[i] || null

    if (key) {

      if (typeof str !== 'string' || str.match(matchVarRegex)) {
        value = true
        i--
      }

      else if (typeof str === 'string' && str.match(/^\[$/)) {

        let args      = params.slice(i+1)
        const closure = args.indexOf(']')

        if (closure !== -1) {
          args = args.slice(0, closure)
          i += args.length+1
        } else {
          i += args.length
        }

        value = this._getKeyValue(args)

      }

      else {
        value = str
      }

      object[key] = cleanProperty(value)
      key = value = null
      continue
    }

    if (str && typeof str === 'string' && str.match(matchVarRegex)) {
      key = cleanVariable(str)

      if (key.indexOf('=') !== -1) {
        const split = key.split('=')
        key         = split[0]
        value       = split[1]

        object[key] = cleanProperty(value)
        key = value = null
        continue
      }

      if (typeof str === 'string' && str.match(/^-[a-zA-Z][0-9]$/)) {
        value = key[1]
        key   = key[0]
        object[key] = cleanProperty(value)
        key = value = null
        continue
      }

      continue
    }

    // Special conditions for tasks arguments
    if (str && typeof str === 'string' && str.match(/^--$/) && i > 0 && object._.indexOf(params[i-1]) !== -1) {
      key = cleanVariable(params[i-1])
      continue
    }

    if (typeof str === 'string') {
      object._.push( str )
    }

  }

  return object

}

Parser.getValidParameters = function( object, config, checkers ) {
  const result = {}

  let param, value
  for (const key in config) {
    param = config[key]
    if (!param.type) param.type = 'boolean'

    if (param.no_key && !isNaN(param.index)) {
      value = object._[param.index]
    } else {
      // Get value from key
      value = object[key]
    }

    // Get value from aliases
    if (value === undefined && param.aliases) {
      for (let i = 0, len = param.aliases.length; i < len; i++) {
        value = object[param.aliases[i]]
        if (value !== undefined) break
      }
    }

    // Check the value
    if (checkers[param.type]) {
      if (!checkers[param.type]( param, value )) {
        value = undefined
      }
    }

    // Get default value
    if (value === undefined && param.hasOwnProperty('defaultValue')) {
      value = param.defaultValue
    }

    // Set result value
    if (value !== undefined) {
      result[key] = value
    }

    param = value = undefined

  }

  return result
}

module.exports = Parser