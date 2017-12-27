'use strict'

const { pad } = require('lol/utils/string')

function getHelp(config) {
  let p = []

  const inline = []
  let str = null, param = null, maxlen = 0
  for (const key in config) {

    param = config[key]
    str = ''

    if (!param.aliases) {
      param.aliases = [ key ]
    } else {
      param.aliases.unshift( key )
    }

    if (param.no_key && !isNaN(param.index)) {
      const defaults = param.default ? ` default="${param.default}"` : ''

      if (Array.isArray(param.values)) {
        inline.splice(param.index, 0, `<${key}=(${param.values.join('|')})${defaults}>`)
      } else {
        inline.splice(param.index, 0, `<${key}=${param.as || 'string'}${defaults}>`)
      }
      continue
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

    maxlen = str.length > maxlen ? str.length : maxlen

    p.push({
      str: str,
      after: '    ' + (param.description || '') + ''
    })
  }

  p = p.map(function(o) {
    return '  ' + pad(o.str, maxlen, ' ', false) + o.after
  })

  return inline.join(' ') + '\n\n' + p.join('\n')
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