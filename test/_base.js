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
