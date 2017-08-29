'use strict'

const cleanVariable = function(str) {
  return str.replace(/^-*/, '')
}

const cleanProperty = function(str) {
  if (typeof str === 'string') {
    if (str === 'true')      return true
    if (str === 'false')     return false
    if (str === 'undefined') return undefined
    if (str === 'null')      return null
    if (!isNaN(Number(str))) return Number(str)

    return str.replace(/(^("|'|`))|(("|'|`)$)/g, '')
  }

  return str
}

const Validators = {

  "boolean": ( parameter, value ) => {
    return typeof value === 'boolean'
  },

  "value": ( parameter, value ) => {
    return value !== null && value !== undefined && value !== '' && typeof value !== 'boolean'
  },

  "enum": ( parameter, value ) => {
    return parameter.values && parameter.values.indexOf(value) !== -1
  }

}

const Utils = {

  /**
   * Split string arguments to array
   *
   * @param {String} str
   * @returns {Array}
   */
  split(str) {

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
          split[j] = split[j].slice(0, index) + quotes[i].slice(0, quotes[i].length)
          break
        }
      }
    }

    return split

  },

  /**
   * Transform parameters to argv array
   *
   * @param {Object} obj
   * @param {Boolean} is_param
   * @returns
   */
  toArray( obj, is_param ) {
    const arr = is_param && obj._ ? obj._.slice(0) : []
    let str = ''

    for (const key in obj) {
      if (is_param && key == '_') continue

      if (key.length === 1) {
        str = `-${key}`
      } else {
        str = `--${key}`
      }

      if (typeof obj[key] === 'boolean') {
        if (obj[key]) arr.push( str )
        continue
      }

      str += `="${obj[key]}"`

      arr.push( str )
    }

    return arr
  },

  /**
   * Get parameters from array
   *
   * @param {Array} parameters
   * @returns {Object}
   */
  getParameters(strOrArray) {
    const parameters = Array.isArray(strOrArray) ? strOrArray.slice(0) : Utils.split(strOrArray)
    const object     = { _: [] }

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

          value = Utils.getARGV(args)

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

  },

  /**
   * Apply configuration to parameters
   *
   * @param {Object} object
   * @param {Object} config
   * @returns {Object}
   */
  getValidParameters( object, config ) {
    const result = { _: [] }

    if (object._) result._ = result._.concat(object._)

    let param, value
    for (const key in config) {
      param = config[key]
      if (!param.type) param.type = 'value'

      if (param.no_key && !isNaN(param.index)) {
        value = object._[param.index]
        if (result._.indexOf(value) !== -1) result._.splice(param.index, 1)
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

      // Validate the value
      if (Validators[param.type]) {
        if (!Validators[param.type]( param, value )) {
          value = undefined
        }
      }

      // Get default value
      if (value === undefined && param.hasOwnProperty('default')) {
        value = param.default
      }

      // Custom validate
      if (typeof param.validate === 'function') {
        value = param.validate(value) ? value : undefined
      }

      // Set result value
      if (value !== undefined) {

        if (param.as == 'number') {
          result[key] = Number(value)
        } else if (param.as == 'boolean' || param.type == 'boolean') {
          result[key] = !!value
        } else {
          result[key] = value
        }

        if (typeof param.transform === 'function') {
          result[key] = param.transform(result[key])
        }
      }

      param = value = undefined

    }

    return result
  },

  /**
   * Split ARGV by contexts
   *
   * @param {any} strOrArr
   * @param {any} contexts
   * @returns
   */
  getContexts( strOrArr, contexts ) {

    const arg_str = typeof strOrArr === 'string' ? strOrArr : strOrArr.join(' ')
    const arg_arr = Array.isArray(strOrArr) ? strOrArr.slice(0): Utils.split(strOrArr)
    const ctxs    = {}

    let index      = -1,
          ilen      = contexts.length,
          prevIndex = -1,
                  i = 0

    let key, match

    const order = []

    for (i = 0, key; i < ilen; i++) {
      const resolver = contexts[i]

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

module.exports = Utils