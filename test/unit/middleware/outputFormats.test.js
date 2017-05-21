const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)


test['output formats'] = {
  beforeEach: function *() {
    this.createAppModules({
      'outputFormats/html2': 'module.exports = { create: function () { return { render: function *() { this.body = 123 } } } }'
    })

    yield this.initApp()

    yield this.startApp({
      startupSteps: [],
      shutdownSteps: [],
    })

    this.outputFormats = this.waigo.load('middleware/outputFormats')

    this.ctx = {
      request: {},
      query: {},
    }
  },

  afterEach: function *() {
    yield this.shutdownApp()
  },

  'invalid format in config': function () {
    expect(() => {
      this.outputFormats({}, {
        formats: {
          html3: true
        }
      })
    }).to.throw('File not found: outputFormats/html3')
  },

  'uses default format when not specified': function *() {
    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    })

    let count = 0

    yield fn.call(this.ctx, function *() {
      count++
    })

    count.must.eql(1)

    _.isGenFn(this.ctx.render).must.be.true()

    expect(this.ctx.request.outputFormat).to.eql('json')
  },

  'invalid format in request': function *() {
    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    })

    this.ctx.query.format = 'html'

    try {
      yield fn.call(this.ctx, Q.resolve())
      throw new Error()
    } catch (err) {
      expect(err.message).to.eql('Invalid output format requested: html')
      expect(err.status).to.eql(400)
    }
  },


  'custom format': function *() {
    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true,
        html2: true
      }
    })

    this.ctx.query.format = 'html2'

    yield fn.call(this.ctx, Q.resolve())

    expect(_.isGenFn(this.ctx.render)).to.be.true()
    expect(this.ctx.request.outputFormat).to.eql('html2')

    yield this.ctx.render.call(this.ctx)

    expect(this.ctx.body).to.eql(123)
  },


  'override format after middleware is setup': function *() {
    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true,
        html2: true
      }
    })

    this.ctx.query.format = 'html2'

    yield fn.call(this.ctx, Q.resolve())

    expect(_.isGenFn(this.ctx.render)).to.be.true()
    expect(this.ctx.request.outputFormat).to.eql('html2')

    this.ctx.request.outputFormat = 'json'

    yield this.ctx.render.call(this.ctx)

    expect(this.ctx.body).to.eql({})
  },



  'converts locals to view objects if possible': function *() {
    const toViewObjectMethodName = this.waigo.load('viewObjects').METHOD_NAME

    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    })

    const locals = {
      dummy: true,
      dummy2: {
        blah: 123
      },
      dummy3: [
        456,
        [ 1 ],
        { bar: 999 },
        {}
      ]
    }

    locals.dummy2[toViewObjectMethodName] = function *() {
      return {
        val: 55
      }
    }

    locals.dummy3[3][toViewObjectMethodName] = function *() {
      return {
        val: 77
      }
    }

    yield fn.call(this.ctx, Q.resolve())

    expect(_.isGenFn(this.ctx.render)).to.be.true()

    yield this.ctx.render.call(this.ctx, null, locals)

    expect(this.ctx.body).to.eql({
      dummy: true,
      dummy2: {
        val: 55
      },
      dummy3: [
        456,
        [ 1 ],
        { bar: 999 },
        { val: 77 }
      ]
    })
  },


  'redirect to url': function *() {
    const fn = this.outputFormats(this.App, {
      paramName: 'format',
      default: 'json',
      formats: {
        json: true
      }
    })

    yield fn.call(this.ctx, Q.resolve())

    expect(_.isGenFn(this.ctx.redirect)).to.be.true()

    yield this.ctx.redirect.call(this.ctx, 'www.test.com')

    expect(this.ctx.body).to.eql({
      redirectTo: 'www.test.com'
    })
  },
}
