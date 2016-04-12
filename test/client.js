'use strict'

var assert = require('assert')
var helper = require('./helper')
var pool = helper.pool
var client = helper.client

describe('SidekiqClient', function () {
  describe('basic push', function () {
    it('sends a job to Redis', function (done) {
      client.push({class: 'email', args: [1, 2, 3]}, function (err, jid) {
        assert.ok(!err)
        assert.ok(jid)
        pool.exec(function (conn) {
          conn.llen('queue:default', function (err, size) {
            assert.equal(1, size)
            done(err)
          })
        })
      })
    })
  })
})
