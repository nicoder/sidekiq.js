'use strict';

var crypto = require('crypto');

/*
 * This is the client-side API for pushing jobs into Redis.
 * You can require this module to access the API in any JS process.
 */
var Sidekiq = {
  NAME: 'Sidekiq',
  LICENSE: 'See LICENSE and the LGPL-3.0 for licensing details.',
  VERSION: '0.5.0',
  default_worker_options: {
    retry: 25,
    queue: 'default'
  }
}

function Job(item) {
  this.payload = item
  this.logger = console;
  this.jid = item.jid;
}

Job.prototype.get = function(name) {
  return this.payload[name]
}

Job.prototype.set = function(name, val) {
  return this.payload[name] = val;
}

function Logging() {
}

function Middleware(client) {
  this.chain = [new Logging]
  this.client = client
}

Middleware.prototype.invoke = function invoke(job, chain) {
  if (chain == null) {
    return invoke(job, this.chain)
  }
  else if (chain[0] != null) {
    var ware = chain[0];
    var rc = ware.call(job, function() {
      invoke(job, chain.slice(1));
    })
    if (!rc) {
      job.logger.warn(ware.toString() + " stopped job push to Redis");
    }
    return rc;
  }
  else {
    return true;
  }
}

Logging.prototype.call = function(job, next) {
  var start = new Date();
  var data = [start, "JID-" + job.jid];

  if (job.bid) {
    data.add("BID-" + job.bid)
  }
  job.logger.info(...data, "start");
  next();
  job.logger.info(...data, `done: ${(new Date() - start) / 1000.0}`);
  return true;
}

function SidekiqClient(redis_pool) {
  var self = this;
  self.pool = redis_pool;
  self.middleware = new Middleware(self);
}

  /*
   * `item` is an object with 'class', 'args' and other keys.
   * `cb` is a callback which is called with a network error or the new job's JID.
   * If cb is called with both arguments as null, that means a middleware
   * stopped the job's push to Redis.
   */
SidekiqClient.prototype.push = function(item, cb) {
  var job = normalize_item(item)
  var payload = process_single(this, job)
  if (payload) {
    raw_push(this.pool, payload, function(err, x) {
      if (err) {
        return cb(err, null);
      }
      cb(null, job.jid);
    });
  } else {
    cb(null, null);
  }
}

function randomJid() {
  return crypto.randomBytes(12).toString('hex');
}

function currentTime() {
  return new Date().getTime() / 1000;
}

function raw_push(pool, payloads, cb) {
  pool.exec(conn => {
    var x = conn.multi();
    atomic_push(x, payloads);
    x.exec(cb);
  })
}

function atomic_push(conn, payloads) {
  var job = payloads[0];
  if (job.get('a')) {
    var results = payloads.map(job => {
      var hash = job.payload;
      var at = hash.delete('at').toString();
      return [at, JSON.stringify(hash)]
    });
    conn.zadd('schedule', results)
  } else {
    var q = job.get('queue');
    var now = currentTime();
    var to_push = payloads.map(job => {
      job.set('enqueued_at', now);
      return JSON.stringify(job.payload);
    });
    conn.sadd('queues', q)
    conn.lpush(`queue:${q}`, to_push)
  }
}

function process_single(client, job) {
  var result = client.middleware.invoke(job)
  if (result) {
    return [job]
  }
  else {
    return null
  }
}

function normalize_item(item) {
  var opts = Sidekiq.default_worker_options

  Object.keys(opts).forEach(function (key) {
    let value = opts[key];
    if (!item.hasOwnProperty(key)) {
      item[key] = value;
    }
  });

  if (!item.hasOwnProperty('jid')) {
    item['jid'] = randomJid();
  }
  if (!item.hasOwnProperty('created_at')) {
    item['created_at'] = currentTime();
  }
  return new Job(item);
}

module.exports = {
  'Sidekiq': Sidekiq,
  'SidekiqClient': SidekiqClient
}
