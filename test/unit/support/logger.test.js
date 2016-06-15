"use strict";

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');

const log4js = require('log4js');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;


var logger;




test['logger'] = {
  beforeEach: function*() {
    yield this.initApp();

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    logger = waigo.load('support/logger');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },


  'init': function*() {
    let spy1 = this.mocker.stub(log4js, 'configure');

    let level = -1;

    let spy2 = this.mocker.stub(log4js, 'getLogger', () => {
      return {
        setLevel: (l) => {
          level = l;
        }
      };
    });

    let log = logger.init({
      category: 'blah',
      appenders: [{
        type: 'console',
      }],
      minLevel: 'debug'
    });

    spy1.should.have.been.calledWithExactly({
      appenders: [{
        type: 'console',
      }]
    });

    spy2.should.have.been.calledWithExactly('blah');

    level.should.eql('debug');

    log.create.should.eql(logger.create);
  },

  'create': {
    'direct': function*() {
      let level = -1;

      let spy2 = this.mocker.stub(log4js, 'getLogger', () => {
        return {
          setLevel: (l) => {
            level = l;
          }
        };
      });

      let spy1 = this.mocker.stub(log4js, 'configure');

      logger.init({
        minLevel: 'ERROR'
      });

      level.should.eql('ERROR');

      level = -1;

      let log = logger.create('test');

      level.should.eql('ERROR');

      log.create.should.be.defined;

      spy2.should.have.been.calledWithExactly('test');

      level = -1;

      let child = log.create('blah');

      level.should.eql('ERROR');

      child.create.should.be.defined;

      spy2.should.have.been.calledWithExactly('test/blah');
    },
  },
};



