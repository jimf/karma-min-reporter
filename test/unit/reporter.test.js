const test = require('tape')
const mod = require('../..')
const MinReporter = mod['reporter:min'][1]

function baseReporter$onRunStart () {}
function baseReporter$specFailure () {}
function baseReporter$onRunComplete () {}
function baseReporterDecorator (context) {
  context._decorated = true
  context.onRunStart = baseReporter$onRunStart
  context.specFailure = baseReporter$specFailure
  context.onRunComplete = baseReporter$onRunComplete
}
function formatError (log) { return log }
const config = {}

test('min reporter module export', t => {
  t.deepEqual(mod['reporter:min'], ['type', MinReporter],
    'exports module with expected DI structure')
  t.end()
})

test('min reporter $inject', t => {
  t.deepEqual(MinReporter.$inject, ['baseReporterDecorator', 'formatError', 'config'],
    'specifies necessary DI dependencies')
  t.end()
})

test('min reporter initialization', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  t.ok(subject._decorated, 'calls baseReporterDecorator with self reference')
  t.deepEqual(subject._failures, [], 'initializes a list of failures')
  t.ok(subject.onRunStart && subject.onRunStart !== baseReporter$onRunStart,
    'overrides default onRunStart')
  t.ok(subject.specFailure && subject.specFailure !== baseReporter$specFailure,
    'overrides default specFailure')
  t.ok(subject.onRunComplete && subject.onRunComplete !== baseReporter$onRunComplete,
    'overrides default onRunComplete')
  t.end()
})

test('min reporter #onRunStart()', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  const writes = []
  subject.write = msg => {
    writes.push(msg)
  }
  subject.onRunStart()
  t.ok(subject._start && (new Date() - subject._start) <= 2,
    'records test suite start time')
  t.ok(writes.indexOf('\u001b[2J') === 0, 'clears the screen')
  t.ok(writes.indexOf('\u001b[1;3H') === 1, 'resets cursor position')
  t.end()
})

test('min reporter #specFailure()', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  const browsers = [{}]
  const result = {}
  subject.specFailure(browsers, result)
  t.deepEqual(subject._failures, [result], 'records failure results')
  t.end()
})

test('min reporter #onRunComplete(), normal run', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  const writes = []
  subject.write = msg => {
    writes.push(msg)
  }
  const failure = {
    suite: ['Array', '#indexOf()'],
    description: 'should return -1 when not found',
    log: [
      'Expected null to be -1.\n',
      'foo/foo.js:10:38\n',
      'loaded@http://localhost:9876/context.js:151:17\n'
    ]
  }
  const browsers = [
    { lastResult: {} },
    { lastResult: { skipped: 1 } }
  ]
  const result = {
    success: 1,
    failed: 1,
    error: false,
    disconnected: false,
    exitCode: 1
  }

  subject.onRunStart()
  subject.specFailure(browsers, failure)
  subject.onRunComplete(browsers, result)

  const actual = writes[2]
    .replace(/\(\d+ms\)/, '(XXXms)')
    .split('\n')
    .splice(0, 4)
    .join('\n')
  const expected = `
  1 passed (XXXms)
  1 skipped
  1 failed`

  t.equal(actual, expected, 'writes test suite results in min-reporter formatting')
  t.deepEqual(subject._failures, [], 'resets recorded failures')
  t.end()
})

test('min reporter #onRunComplete(), no browsers', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  const writes = []
  subject.write = msg => {
    writes.push(msg)
  }
  const browsers = []
  const result = {
    success: 1,
    failed: 1,
    error: false,
    disconnected: false,
    exitCode: 1
  }

  subject.onRunStart()
  subject.onRunComplete(browsers, result)

  t.equal(writes.length, 2, 'skips reporting')
  t.end()
})

test('min reporter #onRunComplete(), disconnected', t => {
  const subject = new MinReporter(baseReporterDecorator, formatError, config)
  const writes = []
  subject.write = msg => {
    writes.push(msg)
  }
  const browsers = [
    { lastResult: {} }
  ]
  const result = {
    success: null,
    failed: null,
    error: false,
    disconnected: true,
    exitCode: 1
  }

  subject.onRunStart()
  subject.onRunComplete(browsers, result)

  t.equal(writes.length, 2, 'skips reporting')
  t.end()
})
