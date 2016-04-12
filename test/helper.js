'use strict'

var Redis = require('ioredis')
var Pool = require('generic-pool').Pool

Redis.Promise.onPossiblyUnhandledRejection(function (err) {
  console.error('UNHANDLED REDIS ERROR')
  console.error(err)
})

Pool.prototype.exec = function (fn) {
  var self = this
  self.acquire(function (err, client) {
    if (err) {
      throw new Error('Something')
    } else {
      fn(client)
      self.release(client)
    }
  })
}

var pool = new Pool({
  name: 'sidekiq.js',
  create: function (callback) {
    var x = new Redis({
      host: 'localhost',
      port: 6379,
      db: 15,
      connectTimeout: 200,
      connectionName: 'sidekiq.js',
      showFriendlyErrorStack: true
    })
    x.on('error', function (err) {
      console.error('REDIS ERROR')
      console.error(err)
    })
    callback(null, x)
  },
  destroy: function (client) {
    client.disconnect()
  },
  max: 20,
  log: false,
  idleTimeoutMillis: 15000,
  reapIntervalMillis: 1000
})

// TODO: Need to make this blocking so the flushdb doesn't happen mid-test.
pool.exec((conn) => {
  conn.flushdb()
})

var SidekiqClient = require('../lib/client').SidekiqClient
var client = new SidekiqClient(pool)

exports['client'] = client
exports['pool'] = pool
