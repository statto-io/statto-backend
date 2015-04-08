// --------------------------------------------------------------------------------------------------------------------
//
// statto-backend/test/backend.js
//
// Copyright 2015 Tynio Ltd.
//
// --------------------------------------------------------------------------------------------------------------------

// no requires

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
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = stattoBackendTest

// --------------------------------------------------------------------------------------------------------------------
