'use strict';

var assert = require("assert");
var client = require("./helper").client;

describe('SidekiqClient', function() {

  describe('basic push', function() {
    it('sends a job to Redis', function(done) {
      client.push({class: "email", args: [1,2,3]}, function(err, jid) {
        assert.ok(jid);
        done(err);
      });
    })
  })

});
