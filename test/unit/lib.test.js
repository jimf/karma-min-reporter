require('colors')

const test = require('tape')
const subject = require('../../lib')

const getOpts = opts =>
  Object.assign({
    passed: 1,
    skipped: 0,
    failures: [],
    duration: 50,
    formatError: (msg, indent) => indent + msg,
    useColors: false
  }, opts)

test('lib no colors, all passing', t => {
  const actual = subject.formatResults(getOpts())
  const expected =
`
  1 passed (50ms)

`
  t.equal(actual, expected, 'shows number of passing results with duration')
  t.end()
})

test('lib no colors, passes and skips', t => {
  const actual = subject.formatResults(getOpts({ skipped: 1 }))
  const expected =
`
  1 passed (50ms)
  1 skipped

`
  t.equal(actual, expected, 'shows number of passed and skipped')
  t.end()
})

test('lib no colors, passes and failures', t => {
  const actual = subject.formatResults(getOpts({
    failures: [{
      suite: ['Array', '#indexOf()'],
      description: 'should return -1 when not found',
      log: [
        'Expected null to be -1.\n',
        'foo/foo.js:10:38\n',
        'loaded@http://localhost:9876/context.js:151:17\n'
      ]
    }]
  }))
  const expected =
`
  1 passed (50ms)
  1 failed

  1) Array #indexOf() should return -1 when not found:
      Expected null to be -1.
      foo/foo.js:10:38
      loaded@http://localhost:9876/context.js:151:17

`
  t.equal(actual, expected, 'shows number of passed and failed with failure details')
  t.end()
})

test('lib colors, all passing', t => {
  const actual = subject.formatResults(getOpts({
    useColors: true
  }))
  const expected = [
    '\n',
    '  1 passed'.green + ' (50ms)\n'.grey,
    '\n'
  ].join('')
  t.equal(actual, expected, 'shows passing in green, duration in grey')
  t.end()
})

test('lib colors, passes and skips', t => {
  const actual = subject.formatResults(getOpts({
    useColors: true,
    skipped: 1
  }))
  const expected = [
    '\n',
    '  1 passed'.green + ' (50ms)\n'.grey,
    '  1 skipped\n'.cyan,
    '\n'
  ].join('')
  t.equal(actual, expected, 'shows skips in cyan')
  t.end()
})

test('lib colors, passes and failures', t => {
  const actual = subject.formatResults(getOpts({
    useColors: true,
    failures: [{
      suite: ['Array', '#indexOf()'],
      description: 'should return -1 when not found',
      log: [
        'Expected null to be -1.\n',
        'foo/foo.js:10:38\n',
        'loaded@http://localhost:9876/context.js:151:17\n'
      ]
    }]
  }))
  const expected = [
    '\n',
    '  1 passed'.green + ' (50ms)\n'.grey,
    '  1 failed\n'.red,
    '',
    '\n  1) Array #indexOf() should return -1 when not found:\n'.red,
    '      Expected null to be -1.\n'.grey,
    '      foo/foo.js:10:38\n'.grey,
    '      loaded@http://localhost:9876/context.js:151:17\n'.grey,
    '\n'
  ].join('')
  t.equal(actual, expected, 'shows failure details in red and grey')
  t.end()
})

test('lib test duration in seconds', t => {
  const actual = subject.formatResults(getOpts({
    duration: 2500
  }))
  const expected =
`
  1 passed (3s)

`
  t.equal(actual, expected, 'shows duration rounded to the nearest second')
  t.end()
})

test('lib test duration in minutes', t => {
  const actual = subject.formatResults(getOpts({
    duration: 2500 * 60
  }))
  const expected =
`
  1 passed (3m)

`
  t.equal(actual, expected, 'shows duration rounded to the nearest minute')
  t.end()
})

test('lib test duration in hours', t => {
  const actual = subject.formatResults(getOpts({
    duration: 2500 * 60 * 60
  }))
  const expected =
`
  1 passed (3h)

`
  t.equal(actual, expected, 'shows duration rounded to the nearest hour')
  t.end()
})

test('lib test duration in days', t => {
  const actual = subject.formatResults(getOpts({
    duration: 2500 * 60 * 60 * 24
  }))
  const expected =
`
  1 passed (3d)

`
  t.equal(actual, expected, 'shows duration rounded to the nearest day')
  t.end()
})

// Test to ensure string interpolation isn't too naive.
test('lib test suite uses internal string placeholders in strings', t => {
  const actual = subject.formatResults(getOpts({
    failures: [{
      suite: ['Foo %s', 'bar %s'],
      description: 'should %s',
      log: [
        'Expected "%s" to be -1.\n',
        'foo/foo.js:10:38\n',
        'loaded@http://localhost:9876/context.js:151:17\n'
      ]
    }]
  }))
  const expected =
`
  1 passed (50ms)
  1 failed

  1) Foo %s bar %s should %s:
      Expected "%s" to be -1.
      foo/foo.js:10:38
      loaded@http://localhost:9876/context.js:151:17

`
  t.equal(actual, expected, 'does not perform interpolation on string values')
  t.end()
})
