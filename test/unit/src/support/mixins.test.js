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


var mixins = null;


test['mixins'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        mixins = waigo.load('support/mixins');        
      })
      .nodeify(done);
  },

  'apply mixins to class': function() {
    var mixin1 = {
      a: function() {},
      b: true,
      c: function*() {},
      d: null
    };

    var mixin2 = {
      e: 999,
      f: undefined,
      g: function() {}
    };

    var Class = function() {};
    Class.prototype.c = 1235;

    mixins.applyTo(Class, mixin1, mixin2);

    expect(Class.prototype.a).to.eql(mixin1.a);
    expect(Class.prototype.b).to.be.undefined;
    expect(Class.prototype.c).to.eql(1235);
    expect(Class.prototype.d).to.be.undefined;
    expect(Class.prototype.e).to.be.undefined;
    expect(Class.prototype.f).to.be.undefined;
    expect(Class.prototype.g).to.eql(mixin2.g);
  },


  'Mixin: HasViewObject': {
    'toViewObject': function(done) {
      testUtils.spawn(function*() {
        try {
          yield* mixins.HasViewObject.toViewObject();
          throw new Error('should not be here');
        } catch (err) {
          expect(err.message).to.eql('Not yet implemented');          
        }
      })
        .nodeify(done);
    }
  }
  
};



