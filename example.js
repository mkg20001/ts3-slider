'use strict'

const TS3Slider = require('.')
const Query = require('teamspeak-query-client')
const Hapi = require('hapi')
const { waterfall } = require('async')

let CHANNELS

const server = new Hapi.server({ // creates a new api server
  port: 5389,
  host: '::',
  routes: {
    cors: true
  }
})

server.route({ // serves /ts3 endpoint
  method: 'GET',
  path: '/ts3',
  handler: () => CHANNELS
})

const query = new Query({ host: 'your-server.de', port: 10011 }) // creates query for this server

function update (cb) {
  TS3Slider.fetch(query, (err, res) => { // fetches channels and updates CHANNELS variable
    if (err) return cb(err)
    CHANNELS = res
    cb()
  })
}

waterfall([
  cb => query.connect(cb), // connects to query via telnet
  cb => query.login('username', 'password', cb), // performs authentication
  (res, cb) => query.cmd('use', 1, cb), // selects vServer (usually 1 for self-hosted)
  (res, cb) => query.cmd('clientupdate', { client_nickname: 'TS3Slider Example' }, cb), // changes nickname of query
  (res, cb) => update(cb), // runs first update
  cb => server.start().then(() => cb(), cb) // starts api (http://localhost:5389/ts3)
], err => {
  if (err) throw err
  setInterval(() => update(), 1000 * 10) // updates every 10s
})
