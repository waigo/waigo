"use strict";

require('co-mocha');  /* enable generator test functions */
const testUtils = require('waigo-test-utils');

const waigo = require('../src'),
  _ = waigo._;



module.exports = function(_module) {
  let test = testUtils.mocha(_module, {
    extraDataAndMethods: {
      shouldThrow: function*(gen, err) {
        try {
          yield gen;
        } catch (e) {
          (function() { throw e; }).should.throw(err);
          return;
        }
        
        throw new Error('Expected error not thrown: ' + err);
      },
      clearDb: function*(modelName) {
        let models;

        if (modelName) {
          models = [modelName];
        } else {
          models = ['Acl', 'Activity', 'Cron', 'User'];
        }

        for (let model of models) {
          yield this.app.models[model].rawQry().delete().run();
        }
      },
      initApp: function*() {
        waigo.reset();

        yield waigo.init({
          appFolder: this.appFolder,
        });

        this.Application = waigo.load('application');
        this.app = this.Application.app;
      },
      startApp: function*(config) {
        config = _.extend({
          logging: {
            category: "test",
            minLevel: 'DEBUG',
            appenders: [],
          },      
          db: {
            main: {
              type: 'rethinkdb',
              serverConfig: {
                db: 'waigo_test',
                servers: [
                  {
                    host: '127.0.0.1',
                    port: 28015,
                  },
                ],
              },
            },
          },
        }, config);

        yield this.Application.start({
          postConfig: (cfg) => {
            _.extend(cfg, config);
          },
        });
      },
    },
  });

  test.beforeEach = function*() {
    this.deleteTestFolders();
    this.createTestFolders();
  };

  test.afterEach = function*() {
    this.deleteTestFolders();
  };

  let tests = {};

  test.tests = tests;

  return tests;
};
