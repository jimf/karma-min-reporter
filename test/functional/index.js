const spawn = require('cross-spawn')
const test = require('tape')

test('all passing', t => {
  const result = spawn.sync('karma', [
    'start',
    'test/functional/karma.conf.all-passing.js'
  ])
  t.ok(result.stdout.toString().indexOf('1 passed') > 0, 'shows passing results')
  t.equal(result.status, 0, 'exits 0')
  t.end()
})

test('skip', t => {
  const result = spawn.sync('karma', [
    'start',
    'test/functional/karma.conf.skip.js'
  ])
  t.ok(result.stdout.toString().indexOf('1 skipped') > 0, 'shows number of skipped results')
  t.equal(result.status, 0, 'exits 0')
  t.end()
})

test('failure', t => {
  const result = spawn.sync('karma', [
    'start',
    'test/functional/karma.conf.failure.js'
  ])
  t.ok(result.stdout.toString().indexOf('1 failed') > 0, 'shows number of failed results')
  t.notEqual(result.status, 0, 'exits non-zero')
  t.end()
})
