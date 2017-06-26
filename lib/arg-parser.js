'use strict'

const path = require('path')
const pad  = require('./utils/string').pad

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
    this._checkers = {}
  }

  checker(name, checkFn) {
    if (!name || !checkFn) {
      console.warn('No name or check function found')
      return
    }

    this._checkers[name] = checkFn
  }

  parse( parameters, config, type ) {
    config = config || {}
    type   = type || 'valid'

    if (typeof this[`_${type}Parse`] === 'function') {
      return this[`_${type}Parse`]( parameters, config )
    }

    return {}
  }

  split(str) {

    const quotes = str.match(/("|'|`).+("|'|`)/g) || []

    let i = 0, index = -1
    const ilen = quotes.length

    for (i = 0; i < ilen; i++) {
      str = str.replace(quotes[i], '$'+i)
    }

    const split = str.split(' ')

    for (i = 0; i < ilen; i++) {
      index = split.indexOf('$'+i)
      if (split[index]) split[index] = quotes[i].replace(/(^("|'|`))|(("|'|`)$)/g, '')
    }

    return split

  }

  _validParse( parameters, config ) {
    const params = this._getKeyValue(parameters.slice(0))

    return Object.assign(
      { __: params, __config: config },
      this._getValidParameters( params, config )
    )
  }

  _invalidParse( parameters, config ) {
    const params = this._getKeyValue(parameters.slice(0))

    return Object.assign(
      { __config: config },
      params,
      this._getValidParameters( params, config )
    )
  }

  _softParse( parameters ) {
    return this._getKeyValue(parameters.slice(0))
  }

  getContextAndCommandARGV( parameters, config ) {

    const args = parameters.filter(function(arg) {
      return !arg.match(/^-{1,2}\w/)
    })

    let variableIndex = -1,
    variable          = null,
    match             = null,
    isTask            = false,
    isContextVariable = false,
    task              = null,
    regex             = null

    for (let i = 0, len = args.length; i < len; i++) {
      variableIndex = parameters.indexOf(args[i]) - 1

      if (variableIndex < 0) {
        isTask = true
      } else {
        variable = parameters[variableIndex].replace(/^-{1,2}/, '')

        for (const key in config) {
          regex = new RegExp('^'+key+'$')
          match = variable.match(regex)

          if (!match && config[key].aliases) {
            for (let j = 0, leng = config[key].aliases.length; j < leng; j++) {
              regex = new RegExp('^'+config[key].aliases[j]+'$')
              match = variable.match(regex)
              if (match) break
            }
          }

          if (match) {
            isContextVariable = true
            if (config[key].type === 'boolean') isTask = true
            break
          }
        }

      }

      if (!isContextVariable) {
        isTask = true
      }

      if (isTask) {
        task = args[i]
        break
      }

      isContextVariable = false

    }

    if (task) {
      const index = parameters.indexOf(task)
      return { context: parameters.slice(0, index), command: parameters.slice(index) }
    }

    return { context: parameters, command: [] }

  }

  _getValidParameters( object, config ) {
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
      if (this._checkers[param.type]) {
        if (!this._checkers[param.type]( param, value )) {
          value = undefined
        }
      }

      // Get default value
      if (value === undefined) {
        value = this._getDefaultValue(param)
      }

      // Set result value
      if (value !== undefined) {
        result[key] = value
      }

      param = value = undefined

    }

    return result
  }

  _getDefaultValue( arg ) {
    if (arg.hasOwnProperty('default')) {
      return arg.default
    }
    return undefined
  }

  _getFirstArgument( parameters ) {

    let value = undefined

    if (parameters[0].indexOf('-') !== 0) {
      value = parameters[0]
    }

    return value

  }

  _getKeyValue(parameters) {
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

  _createHelp( config ) {
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

    config['help'] = {
      type: 'boolean',
      default: false,
      aliases: [ 'h' ],
      description: p.join('\n')
    }

    return config

  }

}

module.exports = Parser