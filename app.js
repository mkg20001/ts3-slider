#!/usr/bin/env node

'use strict'

const Query = require('teamspeak-query-client')
const bunyan = require('bunyan')
const TS3Slider = require('./lib')
const Hapi = require('@hapi/hapi')
const { waterfall } = require('async')
const once = require('once')
const toCb = (prom, cb) => prom.then((...r) => cb(null, ...r), cb)

const config = require(process.env.CONFIG || './config.json')
let CHANNELS = []

const log = bunyan.createLogger({
  name: 'ts3-slider'
})
const query = new Query(config)
const server = new Hapi.server({
  port: 5389,
  host: '::',
  routes: {
    cors: true
  }
})
const slider = new TS3Slider(query)

function updateChannelList (cb) {
  log.info('Updating channel list...')
  slider.fetch((err, channels) => {
    if (err) return cb(err)
    CHANNELS = channels
    log.info('Updated channel list!')
    cb()
  })
}

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => h.redirect('https://github.com/mkg20001/ts3-slider')
})

server.route({
  method: 'GET',
  path: '/ts3',
  handler: () => CHANNELS
})

waterfall([
  cb => query.connect(cb),
  cb => query.login(config.user, config.pw, cb),
  (res, cb) => query.cmd('use', config.vServer, cb),
  (res, cb) => query.cmd('clientupdate', { client_nickname: config.nickname || 'TeamSpeak3 Slider' }, cb),
  (res, cb) => updateChannelList(cb),
  cb => toCb(server.start(), cb)
], err => {
  if (err) {
    log.error(err)
    throw err
  }

  log.info('Online')

  const n = () => setTimeout(() => updateChannelList(once(n)), config.interval || 1000)
  n()
})
