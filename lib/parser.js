'use strict'

const { getParameters, getContexts } = require('./utils')
const Result  = require('./result')
const Command = require('./command')

class Parser {

  static parse(strOrArray, config) {
    const result = new Result

    if (config) result.config = config

    result.set( getParameters( strOrArray ) )

    return result
  }

  static command(key) {
    return new Command(key)
  }

  static splitContexts(strOrArray, contexts) {
    return getContexts(strOrArray, contexts)
  }

  static getContextARGV(argv, config) {
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