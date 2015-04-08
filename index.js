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
  // get all the rawStats, process them and set the stats
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

    // loops through all the stats, process and save it
    var stats = stattoProcess(raws)
    self.setStats(stats, callback)
    console.log('stats', stats)
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.StattoBackendAbstract = StattoBackendAbstract

// --------------------------------------------------------------------------------------------------------------------
