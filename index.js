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

StattoBackendAbstract.prototype.addRaw = function stats(raw) {
  throw new Error("This function should be overriden : StattoBackendAbstract.addRaw()")
}

StattoBackendAbstract.prototype.getRaws = function getRaws(date, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.getRaws()")
}

StattoBackendAbstract.prototype.setStats = function setStats(stats) {
  throw new Error("This function should be overriden : StattoBackendAbstract.setStats()")
}

StattoBackendAbstract.prototype.getStats = function getStats(date, callback) {
  throw new Error("This function should be overriden : StattoBackendAbstract.getStats()")
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.StattoBackendAbstract = StattoBackendAbstract

// --------------------------------------------------------------------------------------------------------------------
