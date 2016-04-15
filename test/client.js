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

        pool.acquire(function (err, conn) {
          assert.ok(!err)

          conn.llen('queue:default', function (err, size) {
            assert.ok(!err)
            assert.equal(1, size)
            pool.release(conn)
            done(err)
          })
        })
      })
    })
  })
})
