const path = require('path'),
  log4js = require('log4js')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['logger'] = {
  beforeEach: function *() {
    yield this.initApp()

    yield this.startApp({
      startupSteps: []
    })

    this.logger = this.waigo.load('logger')
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'init': function *() {
    const spy1 = this.mocker.stub(log4js, 'configure')

    let level = -1

    const spy2 = this.mocker.stub(log4js, 'getLogger', () => {
      return {
        setLevel: l => {
          level = l
        }
      }
    })

    const log = this.logger.init({
      category: 'blah',
      appenders: [{
        type: 'console',
      }],
      minLevel: 'debug'
    })

    spy1.calledWithExactly({
      appenders: [{
        type: 'console',
      }]
    }).must.be.true()

    spy2.calledWithExactly('blah').must.be.true()

    expect(level).to.eql('debug')

    expect(log.create).to.eql(this.logger.create)
  },

  'create': {
    'direct': function *() {
      let level = -1

      const spy2 = this.mocker.stub(log4js, 'getLogger', () => {
        return {
          setLevel: l => {
            level = l
          }
        }
      })

      this.mocker.stub(log4js, 'configure')

      this.logger.init({
        minLevel: 'ERROR'
      })

      expect(level).to.eql('ERROR')

      level = -1

      const log = this.logger.create('test')

      expect(level).to.eql('ERROR')

      expect(log.create).to.be.a.function()

      spy2.calledWithExactly('test').must.be.true()

      level = -1

      const child = log.create('blah')

      expect(level).to.eql('ERROR')

      expect(child.create).to.be.a.function()

      spy2.calledWithExactly('test/blah').must.be.true()
    },
  },
}
