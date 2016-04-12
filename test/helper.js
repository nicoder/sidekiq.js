'use strict';

var Redis = require('ioredis');
var Pool = require('generic-pool').Pool

Pool.prototype.exec = function(fn) {
  var self = this;
  self.acquire(function(err, client) {
    if (err) {
      throw new Error("Something");
    }
    else {
      fn(client);
      self.release(client);
    }
  });
}


// our test database
var url = "redis://localhost:6379/15";

var pool = new Pool({
    name     : 'sidekiq.js',
    create   : function(callback) {
        callback(null, Redis(url));
    },
    destroy  : function(client) { client.disconnect(); },
    max      : 20,
    log      : false,
    idleTimeoutMillis: 15000,
    reapIntervalMillis: 1000
});

// TODO: Need to make this blocking so the flushdb doesn't happen mid-test.
pool.exec(conn => {
  conn.flushdb();
});

var SidekiqClient = require('../lib/client').SidekiqClient;
var client = new SidekiqClient(pool);

exports['client'] = client
