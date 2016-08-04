# Database connections

_Note: At present only RethinkDB is supported. MongoDB support is planned for the future._

The `database` startup step is responsible for creating connections to databases. The connections are specified in your app's configuration::

```javascript
// file: <project folder>/src/config/base.js

module.exports = function(config) {
  ...
  config.db = {
    db1: {
      type: 'rethinkdb',
      serverConfig: {
        db: 'waigo',
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],
      }
    },
    db2: {
      type: 'rethinkdb',
      serverConfig: {
        db: 'test',
        servers: [
          {
            host: 'another.host.domain.com',
            port: 58015,
          }
        ],
      }
    },
  };
  ...
};
```

The above configuration tells Waigo to create two connection - `mydb` and `db2` - to RethinkDB databases named `waigo` and `test` respectively.

Once setup, these database connections will be accessible at `App.dbs.mydb` and `App.dbs.db2`. Waigo uses [thinodium](https://github.com/hiddentao/thinodium) to connect to databases; thus the returned database connection objects are `Thinodium.Database` instances and expose all the same methods.

The first database specified in the configuration is always assumed to be the main one for your application, and is thus it is also made accessible at `App.db` (i.e. `App.db` === `App.dbs.mydb` in the above example).


## Custom database connectors

If Waigo doesn't support your database type ouf of the box you can add an _adapter_ for your desired type to the `src/support/db` path and expose two methods:

* `create(id, logger, config)` - to create a database connection.
* `closeAll(logger)` - to close all connections prevoiusly created and clean up resources.

For example, let's say you wanted to use a MySQL database. You might have:

```javascript
// file: <project folder>/src/support/db/mysql.js
"use strict";

const mysqlConnect = require('some-msyql-connector-module');

const _connections = {};

exports.create = function*(id, logger, dbConfig) {
  logger.info('Connecting to MySQL', id);

  let db = yield mysqlConnect(dbConfig.serverConfig);

  _connections[id] = db;

  return db;
};


exports.closeAll = function*(logger) {
  logger.info('Close all connections');

  for (let id in _connections) {
    yield _connections[id].disconnect();
  }
};
```

Then in your app's configuration you would have:

```
// file: <project folder>/src/config/base.js

module.exports = function(config) {
  ...
  config.db = {
    db1: {
      type: 'mysql',
      serverConfig: {
        db: 'specialdb',
        servers: [ ... ]
      }
    }
  };
  ...
};
```

