var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var _testUtils = require(path.join(process.cwd(), 'test', '_base'))(module),
  test = _testUtils.test,
  testUtils = _testUtils.utils,
  assert = testUtils.assert,
  expect = testUtils.expect,
  should = testUtils.should,
  waigo = testUtils.waigo;


var _ = require('lodash');


test['underscore'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        _.mixin(waigo.load('support/underscore'));    
      })
      .nodeify(done);
  },
  'get': function() {

    assert.strictEqual(_.get(undefined), undefined);
    assert.strictEqual(_.get(undefined, '', 1234), 1234);

    assert.strictEqual(_.get(null), undefined);
    assert.strictEqual(_.get(null, '', 1234), 1234);

    assert.strictEqual(_.get({}, 'path'), undefined);
    assert.strictEqual(_.get({}, 'path', 1234), 1234);

    var obj = {
      name: 'microsoft',
      people: [
        {
          name: 'john'
        }
      ]
    };

    assert.strictEqual(_.get(obj, 'test2'), undefined);
    assert.strictEqual(_.get(obj, 'test2', 1234), 1234);

    assert.strictEqual(_.get(obj, 'name'), 'microsoft');
    assert.strictEqual(_.get(obj, 'name', 1234), 'microsoft');

    assert.deepEqual(_.get(obj, 'people'), [ { name: 'john' } ]);
    assert.deepEqual(_.get(obj, 'people', 1234), [ { name: 'john' } ]);

    assert.strictEqual(_.get(obj, 'people.0'), obj.people[0]);
    assert.strictEqual(_.get(obj, 'people.0', 1234), obj.people[0]);

    assert.strictEqual(_.get(obj, 'people.1'), undefined);
    assert.strictEqual(_.get(obj, 'people.1', 1234), 1234);

    assert.strictEqual(_.get(obj, 'people.length'), 1);
    assert.strictEqual(_.get(obj, 'people.length', 1234), 1);

    assert.strictEqual(_.get(obj, 'people.0.test'), undefined);
    assert.strictEqual(_.get(obj, 'people.0.test', 1234), 1234);

    assert.strictEqual(_.get(obj, 'people.0.name'), 'john');
    assert.strictEqual(_.get(obj, 'people.0.name', 1234), 'john');    
  }
};
