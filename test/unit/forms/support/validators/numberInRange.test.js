const path = require('path')

const test = require(path.join(process.cwd(), 'test', '_base'))(module)

test['isLength'] = {
  beforeEach: function *() {
    yield this.initApp()

    this.validator = this.waigo.load('forms/support/validators/numberInRange')
  },

  'too small': function *() {
    const fn = this.validator({
      min: 5
    })

    yield fn(null, null, 5)
    yield this.mustThrow(fn(null, null, 4), 'Must be greater than or equal to 5')
  },

  'too big': function *() {
    const fn = this.validator({
      max: 3
    })

    yield fn(null, null, 3)
    yield this.mustThrow(fn(null, null, 4), 'Must be less than or equal to 3')
  },


  'range': function *() {
    const fn = this.validator({
      min: 1,
      max: 3
    })

    yield fn(null, null, 1)
    yield fn(null, null, 2)
    yield fn(null, null, 3)
    yield this.mustThrow(fn(null, null, 4), 'Must be between 1 and 3 inclusive')
  },


  'converts first': function *() {
    const fn = this.validator({
      min: 1,
      max: 3
    })

    yield fn(null, null, 2)
    yield this.mustThrow(fn(null, null, '4'), 'Must be between 1 and 3 inclusive')
  },



}
