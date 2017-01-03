var lib = require('./lib')

function MinReporter (baseReporterDecorator, formatError, config) {
  baseReporterDecorator(this)

  this._failures = []

  var _onRunStart = this.onRunStart
  this.onRunStart = function () {
    _onRunStart.call(this)

    this._start = new Date()

    // Clear screen
    this.write('\u001b[2J')
    // Set cursor position
    this.write('\u001b[1;3H')
  }

  this.specFailure = function (browsers, result) {
    this._failures.push(result)
  }

  this.onRunComplete = function (browsers, result) {
    if (browsers.length >= 1 && !result.disconnected) {
      // BrowserCollection lacks a reduce method.
      var skipped = browsers.map(function (browser) {
        return browser.lastResult.skipped || 0
      }).reduce(function (acc, skips) {
        return acc + skips
      }, 0)

      this.write(lib.formatResults({
        passed: result.success,
        skipped: skipped,
        failures: this._failures,
        duration: (new Date()) - this._start,
        formatError: formatError,
        useColors: Boolean(config.colors)
      }))
    }
    this._failures.splice(0, this._failures.length)
  }
}

MinReporter.$inject = ['baseReporterDecorator', 'formatError', 'config']

module.exports = {
  'reporter:min': ['type', MinReporter]
}
