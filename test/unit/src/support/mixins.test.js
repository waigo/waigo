var moment = require('moment'),
  path = require('path'),
  Promise = require('bluebird');

var testBase = require('../../../_base'),
  assert = testBase.assert,
  expect = testBase.expect,
  should = testBase.should,
  testUtils = testBase.utils,
  test = testUtils.createTest(module),
  waigo = testBase.waigo;


var mixins = null;


test['mixins'] = {
  beforeEach: function(done) {
    waigo.initAsync()
      .then(function() {
        mixins = waigo.load('support/mixins');        
      })
      .nodeify(done);
  },

  'extend class with mixins': function() {
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

    mixins.extend(Class, mixin1, mixin2);

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
      Promise.spawn(function*() {
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



