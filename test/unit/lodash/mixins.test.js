const _ = require('lodash'),
  path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['lodash'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.waigo.load('lodash/mixins')(_)
  },

  'imports': function *() {
    expect(_.bindGen).to.eql(require('genomatic').bind)

    expect(_.isGenFn).to.eql(require('genomatic').isGenFn)

    expect(_.classnames).to.eql(require('classnames'))

    expect(_.pluralize).to.eql(require('pluralize'))

    expect(_.uuid).to.eql(require('uuid'))
  },

  'emailFormat': {
    'greeting': {
      'empty': function *() {
        _.emailFormat('greet').must.eql('Hey')
      },
      'default': function *() {
        _.emailFormat('greet', 'mark').must.eql('mark')
      },
      'username': function *() {
        _.emailFormat('greet', {
          username: 'tom'
        }).must.eql('tom')
      },
      'display name': function *() {
        _.emailFormat('greet', {
          username: 'dave',
          profile: {
            displayName: 'tom'
          }
        }).must.eql('tom')
      },
    }
  },
}
