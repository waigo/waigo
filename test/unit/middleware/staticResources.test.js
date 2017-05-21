const _ = require('lodash'),
  path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['static resources middleware'] = {
  beforeEach: function *() {
    yield this.initApp()
  },

  'app relative folder': function () {
    const m = this.waigo.load('middleware/staticResources')

    const pathJoinSpy = this.mocker.spy(path, 'join')

    const fn = m(this.App, {
      folder: 'static'
    })

    _.isGenFn(fn).must.be.true()

    pathJoinSpy.calledWithExactly(this.waigo.getAppFolder(), 'static').must.be.true()
  }

}
