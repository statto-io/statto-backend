# statto-backend #

An abstract statto-backend which provides common tests.

## Synopsis ##

Imagine that you'd like to implement a backend using a database called 'FreshDB'.

```js
var util = require('util')
var stattoBackend = require('statto-backend')

function StattoBackendFreshDB() {
    // ... implementation details ...
}

util.inherits(StattoBackendFreshDB, stattoBackend.StattoBackendAbstract)
```

## Who is this package for? ##

This package should be used by developers writing a new backend for statto. For implementation
examples, please see the following packages:

* [statto-backend-memory](https://www.npmjs.com/statto-backend-memory) - for testing purposes
* [statto-backend-fs](https://www.npmjs.com/statto-backend-fs) - for a simple implementation example
* [statto-backend-leveldb](https://www.npmjs.com/statto-backend-leveldb) - a fast local backend
* statto-backend-mongodb - using MongoDB (coming soon)
* statto-backend-postgres - using Postgres (coming soon)

All of these packages also pass the test suite contained in this package. Again see these other projects for further
details.

## Implementing a Backend ##

Many functions within a backend are implemented (naively) by the `stattoBackend.StattoBackendAbstract` class. This means two things:

1. You only have to implement a few functions to get a fully working backend
2. You can rely on the abstract class to implement the rest of the interface properly

However:

1. You may want to implement more methods so that you can make efficiency gains that the database affords you

### Methods ###

To get a fully working interface using the `stattoBackend.StattoBackendAbstract` class, you just need to implement:

* `.addRaw(raw, callback)` - should store the raw stats into the datastore
    * `raw` - the raw stats emitted by the `statto` server
    * `callback` - the callback to which any error is passed, no other data
* `.getRaws(date, callback)` - should retrieve all raw stats stored for this timestamp
    * `date` - a `date` or `ts` for which records should be retrieved (where `ts` ~~ `2015-04-04T00:53:15.000Z`)
    * `callback` - a `fn(err, rawArray)` which is called back with an array of stats for this timestamp
* `.setStats(stats, callback)` - should store the processed stats into the datastore
    * `stats` - the processed stats created from all the raw stats for the same timestamp
    * `callback` - the callback to which any error is passed, no other data
* `.getStats(date, callback)` - should retrieve the processed stats stored for this timestamp
    * `date` - a `date` or `ts` for which records should be retrieved (where `ts` ~~ `2015-04-04T00:53:15.000Z`)
    * `callback` - a `fn(err, stats)` which is called back with the stats for this timestamp

Methods implemented by `stattoBackend.StattoBackendAbstract`:

* `.getStats(date, callback)` - should retrieve the merged stats for this timestamp
    * `date` - a `date` or `ts` for which the stats record should be retrieved (where `ts` ~~ `2015-04-04T00:53:15.000Z`)
    * `callback` - a `fn(err, stats)` which is called back with the stats for this timestamp

## Author ##

Written by [Andrew Chilton](http://chilts.org/) - [Twitter](https://twitter.com/andychilton).

Written for [Tynio](https://tyn.io/).

## License ##

The MIT License (MIT). Copyright 2015 Tynio Ltd.

(Ends)
