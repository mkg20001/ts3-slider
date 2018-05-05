'use strict'

const SPACER_RE = /^\[\*spacer.+\] */gmi
const CSPACER_RE = /^\[cspacer.+\] */gmi
const {waterfall} = require('async')

function processClient (client) {
  let out = {}

  out.name = client.client_nickname
//  out.isTalking = Boolean(client.client_flag_talking)
  out.color = client.client_flag_talking ? '#22BBCC' : '#2222CC'
  out.icon = client.client_flag_talking ? 'player_on' : 'player_off'

  return out
}

function processChannel (channel) {
  let out = {}
  let name = channel.channel_name
  out.nid = name
  if (name.match(SPACER_RE) && !channel.pid) {
    out.name = name.replace(SPACER_RE, '')
    out.spacer = true
  } else if (name.match(CSPACER_RE) && !channel.pid) {
    out.name = name.replace(CSPACER_RE, '')
    out.cspacer = true
  } else {
    out.name = name
  }

  out.color = channel.channel_maxclients === -1 ? '#2222CC' : '#CC2222'
  out.icon = channel.channel_maxclients === -1 ? 'channel_red' : 'channel_green'

  out.id = channel.cid
  out.pid = channel.pid

  out.clients = channel.clients.map(processClient)

  return out
}

function buildTree (roots, all, db) {
  roots.forEach(r => {
    r.sub = buildTree(all.filter(c => c.pid === r.id), all, db)
  })
  return roots
}

function fetchData (query, cb) {
  waterfall([
    cb => query.cmd('clientlist', ['-uid', '-away', '-voice', '-times', '-groups', '-info', '-icon', '-country'], cb),
    (res_, cb) => query.cmd('channellist', ['-topic', '-flags', '-voice', '-limits', '-icon'], (err, res) => cb(err, res_, res)),
    (cl, ch, cb) => {
      cl = cl.filter(c => !c.client_type)
      ch.forEach(c => (c.clients = cl.filter(c2 => c.cid === c2.cid)))
      let out = ch.map(processChannel)
      let tree = buildTree(out.filter(c => !c.pid), out, out.reduce((a, b) => {
        a[b.id] = b
        return a
      }, {}))

      cb(null, tree)
    }
  ], cb)
}

class TS3Slider {
  constructor (query) {
    this.query = query
  }
  fetch (cb) {
    return fetchData(this.query, cb)
  }
}

module.exports = TS3Slider
module.exports.fetch = fetchData
