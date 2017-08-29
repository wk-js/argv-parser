'use strict'

const { pad } = require('lol/utils/string')

function getHelp(config) {
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

module.exports = function() {
  this.set('help', {
    type: 'boolean',
    as: 'boolean',
    default: false,
    aliases: [ 'h' ],
    description: getHelp(this.config)
  })
}