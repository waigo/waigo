

const _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  moment = require('moment'),
  shell = require('shelljs'),
  Q = require('bluebird')const test = require(path.join(process.cwd(), 'test', '_base'))(module)const waigo = global.waigotest['lodash'] = {
  beforeEach: function *() {
    yield this.initApp()waigo.load('support/lodashMixins')(_)},

  'imports': function *() {
    _.bindGen.should.eql(require('genomatic').bind)_.isGenFn.should.eql(require('genomatic').isGenFn)_.classnames.should.eql(require('classnames'))_.pluralize.should.eql(require('pluralize'))_.uuid.should.eql(require('node-uuid'))},

  'emailFormat': {
    'greeting': {
      'empty': function *() {
        _.emailFormat('greet').should.eql('Hey')},
      'default': function *() {
        _.emailFormat('greet', 'mark').should.eql('mark')},
      'username': function *() {
        _.emailFormat('greet', {
          username: 'tom'
        }).should.eql('tom')},
      'display name': function *() {
        _.emailFormat('greet', {
          username: 'dave',
          profile: {
            displayName: 'tom'
          }
        }).should.eql('tom')},
    }
  },
}