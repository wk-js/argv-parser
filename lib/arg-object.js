'use strict'

const pad = require('./utils/string').pad

class ARGObject {
  constructor() {
    this.arg_str = ''
    this.arg_arr = []

    this.config       = {}
    this.params       = {}
    this.valid_params = {}
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

    return p
  }

  addHelp() {

    const config = this.config

    config['help'] = {
      type: 'boolean',
      default: false,
      aliases: [ 'h' ],
      description: this.getHelp().join('\n')
    }

    return config

  }
}

module.exports = ARGObject