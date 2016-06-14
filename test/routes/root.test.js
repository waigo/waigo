"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['/'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp();
  },
  afterEach: function*() {
    yield this.shutdownApp();
  },
  'GET': {
    'html': function*() {
      let res = yield this.fetch('/');

      _.get(res, 'headers.content-type', '').should.contain('text/html');
      res.body.should.contain('Your new Waigo app is running correctly');
    },
    'json': function*() {
      let res = yield this.fetch('/', {
        query: {
          format: 'json',
        }
      });

      _.get(res, 'headers.content-type', '').should.contain('application/json');
      res.body.should.eql(JSON.stringify({}));
    },
  },
};

