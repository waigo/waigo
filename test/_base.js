require('co-mocha')/* enable generator test functions */

const path = require('path')
const testUtils = require('waigo-test-utils')
const Q = require('bluebird')
const waigo = require('..')

Q.config({
  longStackTraces: true
})

module.exports = (_module) => {
  const test = testUtils.mocha(_module, waigo, {
    name: path.relative(process.cwd(), _module.filename)
  })

  test.beforeEach = function *() {
    this.clearDb = function *() {
      const _ = waigo._

      const modelNames = _.flatten(_.toArray(arguments))

      for (const model of modelNames) {
        const modelInstance = yield this.App.db.model(model)

        yield modelInstance.rawQry().delete().run()
      }
    }

    const testPackageJsonFile = path.join(process.cwd(), 'test', 'data', 'package.json')

    if (this.fileExists(testPackageJsonFile)) {
      this.deleteFile(testPackageJsonFile)
    }

    this.deleteTestFolders()

    this.createTestFolders()
  }

  test.afterEach = function *() {
    this.deleteTestFolders()
  }

  const tests = {}

  test.tests = tests

  return tests
}
