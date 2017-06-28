'use strict'

const { merge } = require('./utils/object')
const pad = require('./utils/string').pad

class ARGCommand {
  constructor(key, parser) {
    this.key    = key
    this.parser = parser
    this.config = {}
  }

  option(key, params) {
    this.config[key] = merge({
      type: 'value'
    }, params)

    return this
  }

  help() {

    this.config['help'] = {
      type: 'boolean',
      default: false,
      aliases: [ 'h' ],
      description: this.getHelp()
    }

    return this

  }

  getHelp() {
    const config = this.config

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

    return p.join('\n')
  }

  parse(strOrArr) {
    return this.parser.parse(strOrArr, this.config)
  }
}

module.exports = ARGCommand