// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend/test/backend.js
//
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

function isoDate() {
  return (new Date()).toISOString()
}

function stattoBackendTest(backend, test) {

  test('send the backend some stats, then retrieve them again', function(t) {
    t.plan(7)

    var ts1 = isoDate()
    var raw = {
      ts : ts1,
    }

    // send the backend the stats
    backend.addRaw(raw, function(err, foo) {
      t.ok(!err, 'There was no error when storing the stats')
      t.ok(!foo, 'There was nothing else given back to us either')

      // get these stats back out of the store
      backend.getRaws(ts1, function(err, raws) {
        t.ok(!err, 'There was no error when retrieving all of the raw stats')
        t.ok(raws, 'We got something back')
        t.ok(Array.isArray(raws), 'What we got back is an array')
        t.equal(raws.length, 1, 'We got one lot of raw stats back')
        t.deepEqual(raws[0], raw, 'The raw we got back is the same as what we put in')
      })
    })
  })

  test('send the backend some stats, then retrieve them again', function(t) {
    t.plan(5)

    var ts = isoDate()
    var raw1 = { ts : ts, info : { 'foo' : 'bar' } }
    var raw2 = { ts : ts, info : { 'baz' : 'buz' }  }

    // send the backend the stats
    backend.addRaw(raw1, function(err, foo) {
      backend.addRaw(raw2, function(err, foo) {
        // get these stats back out of the store
        backend.getRaws(ts, function(err, raws) {
          t.ok(!err, 'There was no error when retrieving all of the raw stats')
          t.ok(raws, 'We got something back')
          t.ok(Array.isArray(raws), 'What we got back is an array')
          t.equal(raws.length, 2, 'We got one lot of raw stats back')
          // Even though we'd like to get back out the order we got in, we don't actually
          // force it, since it would depend on the store. So long as we get both back out.
          if ( raws[0].info.foo ) {
            t.deepEqual(raws, [ raw1, raw2 ], 'The raw we got back is the same as what we put in')
          }
          else {
            t.deepEqual(raws, [ raw2, raw1 ], 'The raw we got back is the same as what we put in')
          }
        })
      })
    })

  })

  test('set some stats and retrieve them again', function(t) {
    t.plan(5)

    var ts = isoDate()
    var statsOrig = { ts : ts }

    // send the backend the stats
    backend.setStats(statsOrig, function(err, foo) {
      t.ok(!err, 'There was no error when storing the stats')
      t.ok(!foo, 'There was nothing else given back to us either')

      // get these stats back out of the store
      backend.getStats(ts, function(err, stats) {
        t.ok(!err, 'There was no error when retrieving the stats')
        t.ok(stats, 'We got something back')
        t.deepEqual(stats, statsOrig, 'The stats we got back is the same as what we put in')
      })
    })
  })

  test('process stats for a datetime for which no raw stats exist', function(t) {
    t.plan(2)

    var ts = isoDate()

    // process these stats and make sure
    backend.process(ts, function(err, stats) {
      t.ok(!err, 'There was no error processing empty raws')
      t.ok(!stats, 'Since there were no raws, we get no stats back')
    })
  })

  test('create a read stream (which will have no data)', function(t) {
    t.plan(2)

    // Make this in the past so we don't accidentally add some new ones in between
    // (no matter how unlikely).
    var ts1 = '2011-01-23T01:45:00.000Z'
    var ts2 = '2011-01-23T01:45:15.000Z'
    var step = 'waiting-for-end'

    // send the backend the stats
    backend.createStatsReadStream(ts1, ts2)
      .on('data', function(data) {
        t.fail('We should not have received any data')
      })
      .on('error', function(err) {
        t.fail('We should not have received a fail from the getStatsStream()')
      })
      .on('end', function() {
        t.equal(step, 'waiting-for-end', 'End at the right time')
        step = 'waiting-for-close'
      })
      .on('close', function() {
        t.equal(step, 'waiting-for-close', 'Closed at the right time')
      })
    ;
  })

  test('add a couple of stats and create a read stream to get the values back out', function(t) {
    t.plan(4)

    // Make this in the past so we don't accidentally add some new ones in between
    // (no matter how unlikely).
    var ts1 = '2010-04-10T09:57:00.000Z'
    var ts2 = '2010-04-10T09:57:15.000Z'
    var stats1 = { ts : ts1, info : { 'foo' : 'bar' } }
    var stats2 = { ts : ts2, info : { 'baz' : 'buz' }  }
    var step = 'waiting-for-data'

    // send the backend the stats
    backend.setStats(stats1, function(err, foo) {
      backend.setStats(stats2, function(err, foo) {
        backend.createStatsReadStream(ts1, ts2)
          .on('data', function(data) {
            // when we get some data, it's just the first stats1
            t.equal(step, 'waiting-for-data', 'The data event happened at the right time')
            t.deepEqual(data, stats1, 'The data is just the first stats')
            step = 'waiting-for-end'
          })
          .on('error', function(err) {
            t.fail('We should not have received a fail from the getStatsStream()')
          })
          .on('end', function() {
            t.equal(step, 'waiting-for-end', 'End at the right time')
            step = 'waiting-for-close'
          })
          .on('close', function() {
            t.equal(step, 'waiting-for-close', 'Closed at the right time')
          })
      })
    })
  })

  test('add a few stats get a counter range of values back out', function(t) {
    t.plan(2)

    // Make this in the past so we don't accidentally add some new ones in between
    // (no matter how unlikely).
    var ts1 = '2010-01-09T12:27:00.000Z'
    var ts2 = '2010-01-09T12:27:15.000Z'
    var ts3 = '2010-01-09T12:27:30.000Z'
    var stats1 = { counters : { reqs : 3 }, ts : ts1, info : { 'id' : 'one'   } }
    var stats2 = { counters : { reqs : 5 }, ts : ts2, info : { 'id' : 'two'   } }
    var stats3 = { counters : { reqs : 8 }, ts : ts3, info : { 'id' : 'three' } }

    async.each(
      [ stats1, stats2, stats3 ],
      function(stats, done) {
        backend.setStats(stats, done)
      },
      function(err) {
        t.ok(!err, 'There was no error when adding all these stats')

        // now, let's pull the stats back out again
        var expected = [
          { ts : '2010-01-09T12:27:00.000Z', v : 3 },
          { ts : '2010-01-09T12:27:15.000Z', v : 5 },
          { ts : '2010-01-09T12:27:30.000Z', v : 8 },
        ]
        backend.getCounter('reqs', ts1, '2010-01-09T12:27:45.000Z', function(err, range) {
          t.deepEqual(range, expected, 'The counter values are what we expect back')
        })
      }
    )
  })

}

// --------------------------------------------------------------------------------------------------------------------

module.exports = stattoBackendTest

// --------------------------------------------------------------------------------------------------------------------
