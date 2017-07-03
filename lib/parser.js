'use strict'

const ARGObject = require('./object')

const cleanVariable = function(str) {
  return str.replace(/^-*/, '')
}

const cleanProperty = function(str) {
  if (typeof str === 'string') {
    if (str === 'true')  return true
    if (str === 'false') return false
    if (!isNaN(Number(str))) return Number(str)

    return str.replace(/(^("|'|`))|(("|'|`)$)/g, '')
  }

  return str
}

class Parser {

  constructor() {
    this._checkers = {}

    // Register checkers
    this.checker('boolean', ( parameter, value ) => {
      return typeof value === 'boolean'
    })

    this.checker('value', ( parameter, value ) => {
      return value !== null && value !== undefined && value !== '' && typeof value !== 'boolean'
    })

    this.checker('select', ( parameter, value ) => {
      console.log('"select" type is deprecated. Prefer "enum" type.')
      return this._checkers['enum']( parameter, value )
    })

    this.checker('enum', ( parameter, value ) => {
      if (parameter.values && parameter.values.indexOf(value) === -1) {
        return false
      }
      return true
    })
  }

  getClass() {
    return Parser
  }

  checker(name, checkFn) {
    if (!name || !checkFn) {
      console.warn('No name or check function found')
      return
    }

    this._checkers[name] = checkFn
  }

  parse( strOrArr, config ) {
    const arg_arr = Array.isArray(strOrArr) ? strOrArr.slice(0) : Parser.split(strOrArr)
    const obj     = new ARGObject(this)

    if (config) obj.config = config

    obj.set( this.getParameters( arg_arr ) )

    return obj
  }

  getParameters(parameters) {
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

  getValidParameters( object, config ) {
    const checkers = this._checkers
    const result   = { _: [] }

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

        if (param.as == 'number') {
          result[key] = Number(value)
        } else if (param.as == 'boolean' || param.type == 'boolean') {
          result[key] = !!value
        } else {
          result[key] = value
        }

        if (typeof param.coerce === 'function') {
          result[key] = param.coerce(result[key])
        }
      }

      param = value = undefined

    }

    return result
  }

  getContexts( strOrArr, contexts ) {

    const arg_str = typeof strOrArr === 'string' ? strOrArr : strOrArr.join(' ')
    const arg_arr = Array.isArray(strOrArr) ? strOrArr.slice(0): Parser.split(strOrArr)
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

  /**
   * Static
   */
  static split(str) {

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

  }

  static toArray( obj, is_param ) {
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
  }

  static getContextArgv(argv, config) {
    let variableIndex = -1,
    variable          = null,
    match             = null,
    isTask            = false,
    isContextVariable = false,
    task              = null,
    regex             = null

    for (let i = 1, len = argv.length; i < len; i++) {
      variableIndex = argv.indexOf(argv[i]) - 1

      if (argv[i].match(/^-{1,2}\w/)) {
        continue
      }
      if (variableIndex < 0) {
        isTask = true
      } else {
        variable = argv[variableIndex].replace(/^-{1,2}/, '')

        for (const key in config) {
          regex = new RegExp('^'+key+'$')
          match = variable.match(regex)

          if (config[key].type == 'boolean') {
            continue
          }

          if (config[key].no_key && config[key].index && i === config[key].index) {
            isContextVariable = true
            break
          }

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
        task = argv[i]
        break
      }

      isContextVariable = false

    }

    if (task) {
      const index = argv.indexOf(task)
      return argv.slice(0, index)
    }

    return argv
  }

}

module.exports = Parser