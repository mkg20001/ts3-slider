'use strict'

/* Encoding Fncs */

const hexStr = i => {
  let s = i.toString(16).toUpperCase()
  while (s.length < 2) s = '0' + s
  return s
}
const encodeStrict = s => s.split('').map(c => c.charCodeAt(0)).map(i => '%' + hexStr(i)).join('')

const ts3link = (serv, chan) => {
  let i = 'ts3server://' + serv
  if (chan) i += '?channel=' + encodeStrict(chan)
  return i
}

/* Open Shim */

const open = link => {
  window.open(link)
}

/* Slider Class */

let $ = window.jQuery

if (typeof module !== 'undefined' && module.exports) {
  $ = require('jquery') // eslint-disable-line node/no-missing-require
}

class Slider {
  constructor (e, api, ts3, ts3imgurl) {
    this.api = api
    this.ts3 = ts3
    this._e = e
    this.e = () => $(e)
    $(e).addClass('ts3-slider')
    this.imgu = ts3imgurl
  }

  get (cb) {
    window.fetch(this.api + '?cache=' + Date.now()).then(res => res.json(), cb).then(r => cb(null, r), cb)
  }

  update (cb) {
    const { e } = this
    this.get((err, res) => {
      if (err) return cb(err)
      if (!Array.isArray(res)) return cb(new Error('No res'))
      e().find('.channels-main').children().remove()
      this.buildTree(e().find('.channels-main'), res)

      cb()
    })
  }

  buildTree (el, tree, pre) {
    const m = $('<ul></ul>')
    m.addClass('channels')

    if (pre) {
      pre(m)
    }

    tree.forEach(c => {
      const eo = $('<li></li>')
      const e = $('<div></div>')
      const n = $('<tt></tt>')
      const i = $('<i></i>')

      e.addClass('channel')
      eo.addClass('channel-outer')

      if (c.cspacer) {
        e.addClass('channel-cspacer')
      }

      if (c.spacer) {
        e.addClass('channel-spacer')
        n.text(c.name.repeat(100).substr(0, 50))
      } else {
        n.text(c.name)
      }

      if (!c.spacer && !c.cspacer) {
        i.addClass('channel-icon')
        i.css('background', 'url(' + JSON.stringify(this.imgu + c.icon + '.svg') + ') no-repeat')

        e.append(i)

        e.on('click', () => open(ts3link(this.ts3, c.nid)))
      }

      e.append(n)
      eo.append(e)
      m.append(eo)

      this.buildTree(eo, c.sub, m2 => {
        c.clients.forEach(cl => {
          const ce = $('<li></li>')
          const cn = $('<tt></tt>')
          const ci = $('<i></i>')

          ce.addClass('client')
          ci.addClass('client-icon')
          ci.css('background', 'url(' + JSON.stringify(this.imgu + cl.icon + '.svg') + ') no-repeat')

          cn.text(cl.name)
          ce.append(ci)
          ce.append(cn)

          m2.append(ce)
        })
      })
    })

    el.append(m)

    return m
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Slider
}
