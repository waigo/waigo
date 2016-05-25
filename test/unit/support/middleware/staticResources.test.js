"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['static resources middleware'] = {
  beforeEach: function*() {
    yield this.initApp();
  },

  'app relative folder': function() {
    var m = waigo.load('support/middleware/staticResources');

    var pathJoinSpy = this.mocker.spy(path, 'join');

    var fn = m({
      folder: 'static'
    });

    _.isGenFn(fn).should.be.true;

    pathJoinSpy.should.have.been.calledWithExactly(waigo.getAppFolder(), 'static');
  }

};
