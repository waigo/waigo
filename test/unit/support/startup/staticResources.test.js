"use strict";

const _ = require('lodash'),
  fs = require('fs'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird');


const test = require(path.join(process.cwd(), 'test', '_base'))(module);
const waigo = global.waigo;



test['static resources'] = {
  beforeEach: function*() {
    this.createPluginModules('waigo_TESTPLUGIN', {
      '../public/js/app': 'test',
    });

    yield this.initApp({
      plugins: {
        names: ['waigo_TESTPLUGIN']
      }
    });

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    });

    this.setup = waigo.load('support/startup/staticResources');

    this.tmpFolder = path.join(shell.tempdir(), 'waigo-app');
  },

  afterEach: function*() {
    yield this.shutdownApp();
  },

  'deletes tmp folder': function*() {
    shell.mkdir('-p', this.tmpFolder);

    let tmpFile = path.join(this.tmpFolder, 'test.txt');

    fs.writeFileSync(tmpFile, 'test');
    fs.statSync(tmpFile);

    yield this.setup(this.app);

    this.expect(() => { 
      fs.statSync(this.tmpFolder)
    }).to.throw.Error;
  },

  'deletes existing _gen folder': function*() {
    const genFolder = path.join(this.publicFolder, '_gen'),
      tmpFile = path.join(genFolder, 'test.txt');

    shell.mkdir('-p', genFolder);
    fs.writeFileSync(tmpFile, 'test');

    yield this.setup(this.app);

    this.expect(() => { 
      fs.statSync(tmpFile)
    }).to.throw.Error;
  },

  'does not copy app stuff to _gen folder': function*() {
    fs.writeFileSync(path.join(this.publicFolder, 'test.js'), 'test');

    yield this.setup(this.app);

    fs.statSync(path.join(this.publicFolder, '_gen', 'waigo'))

    this.expect(() => { 
      fs.statSync(path.join(this.publicFolder, '_gen', 'app'))
    }).to.throw.Error;
  },

  'copies framework stuff to _gen folder': function*() {
    yield this.setup(this.app);

    fs.statSync(path.join(this.publicFolder, '_gen', 'waigo', 'js', 'app.js'));
    fs.statSync(path.join(this.publicFolder, '_gen', 'waigo', 'css', 'app.css'));
  },

  'copies plugin stuff to _gen folder': function*() {
    yield this.setup(this.app);

    fs.statSync(path.join(this.publicFolder, '_gen', 'waigo_TESTPLUGIN', 'js', 'app.js'));
  },

  'app.staticUrl': {
    beforeEach: function*() {
      fs.writeFileSync(path.join(this.publicFolder, 'test.js'), 'test');

      yield this.setup(this.app);      
    },

    'app': function*() {
      this.app.staticUrl('test.js').should.eql('/test.js');
    },

    'plugin': function*() {
      this.app.staticUrl('waigo_TESTPLUGIN:js/app.js').should.eql('/_gen/waigo_TESTPLUGIN/js/app.js');
    },

    'waigo': function*() {
      this.app.staticUrl('waigo:js/app.js').should.eql('/_gen/waigo/js/app.js');
    },
  }
};
