// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend-leveldb/index.js
//
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// core
var util = require('util')
var events = require('events')
var crypto = require('crypto')

// npm
var stattoMerge = require('statto-merge')
var stattoProcess = require('statto-process')

// --------------------------------------------------------------------------------------------------------------------
// constructor

function StattoBackendAbstract() {
  // empty
}

util.inherits(StattoBackendAbstract, events.EventEmitter);

// --------------------------------------------------------------------------------------------------------------------
// methods

StattoBackendAbstract.prototype._getHash = function _getHash(obj) {
  var str = JSON.stringify(obj)
  return crypto.createHash('sha1').update(str).digest('hex')
}

StattoBackendAbstract.prototype._datify = function _datify(date) {
  if ( date instanceof Date ) {
    return date
  }

  if ( typeof date === 'string' ) {
    return new Date(date)
  }

  if ( typeof date === 'number' ) {
    return new Date(date)
  }

  return undef
}

StattoBackendAbstract.prototype.addRaw = function stats(raw, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.addRaw()")
}

StattoBackendAbstract.prototype.getRaws = function getRaws(date, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.getRaws()")
}

StattoBackendAbstract.prototype.setStats = function setStats(stats, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.setStats()")
}

StattoBackendAbstract.prototype.getStats = function getStats(date, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.getStats()")
}

StattoBackendAbstract.prototype.process = function process(date, callback) {
  // get all the rawStats, merge them, process it and set the stats
  var self = this
  callback = callback || noop

  date = self._datify(date)
  if ( !date ) {
    return process.nextTick(function() {
      callback(new Error('Unknown date type : ' + typeof date))
    })
  }
  var ts = date.toISOString()

  // get all the raw stats out
  self.getRaws(date, function(err, raws) {
    if (err) return callback(err)

    // if there are no stats, then don't save anything
    if ( !raws.length ) {
      return callback()
    }

    // merge all of these raws down to one raw
    var info = {
      length : raws.length,
      ts : (new Date()).toISOString(),
    }
    var mergedRaw = stattoMerge(info, raws)

    // loops through all the stats, process and save it
    var stats = stattoProcess(mergedRaw)
    self.setStats(stats, callback)
  })
}

StattoBackendAbstract.prototype.createStatsReadStream = function createStatsReadStream(from, to, callback) {
  // * from - greater than or equal to (always included)
  // * to - less than (therefore never included)
  throw new Error("This function should be overriden : StattoBackendAbstract.createStatsReadStream()")
}

StattoBackendAbstract.prototype.getCounter = function getCounter(name, from, to, callback) {
  var self = this

  // just grab each complete set of stats and extract what we need
  var periods = []

  self.createStatsReadStream(from, to)
    .on('data', function(stats) {
      if ( stats.counters[name] ) {
        periods.push({
          ts : stats.ts,
          v  : stats.counters[name],
        })
      }
      // else, don't add this to the array
    })
    .on('error', function (err) {
      callback(err)
    })
    .on('end', function () {
      callback(null, periods)
    })
  ;
}

StattoBackendAbstract.prototype.getGauge = function getGauge(name, from, to, callback) {
  var self = this

  // just grab each complete set of stats and extract what we need
  var periods = []

  self.createStatsReadStream(from, to)
    .on('data', function(stats) {
      if ( stats.gauges[name] ) {
        periods.push({
          ts : stats.ts,
          v  : stats.gauges[name],
        })
      }
      // else, don't add this to the array
    })
    .on('error', function (err) {
      callback(err)
    })
    .on('end', function () {
      callback(null, periods)
    })
  ;
}

StattoBackendAbstract.prototype.getTimer = function getTimer(name, from, to, callback) {
  var self = this

  // just grab each complete set of stats and extract what we need
  var periods = []

  self.createStatsReadStream(from, to)
    .on('data', function(stats) {
      if ( stats.timers[name] ) {
        periods.push({
          ts : stats.ts,
          v  : stats.timers[name],
        })
      }
      // else, don't add this to the array
    })
    .on('error', function (err) {
      callback(err)
    })
    .on('end', function () {
      callback(null, periods)
    })
  ;
}

StattoBackendAbstract.prototype.getSet = function getSet(name, from, to, callback) {
  var self = this

  // just grab each complete set of stats and extract what we need
  var periods = []

  self.createStatsReadStream(from, to)
    .on('data', function(stats) {
      if ( stats.sets[name] ) {
        periods.push({
          ts : stats.ts,
          v  : stats.sets[name],
        })
      }
      // else, don't add this to the array
    })
    .on('error', function (err) {
      callback(err)
    })
    .on('end', function () {
      callback(null, periods)
    })
  ;
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.StattoBackendAbstract = StattoBackendAbstract

// --------------------------------------------------------------------------------------------------------------------
