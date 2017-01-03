require('colors')

var second = 1000
var minute = second * 60
var hour = minute * 60
var day = hour * 24

var PASS = '  %s passed'
var TIME = ' (%s)\n'
var SKIP = '  %s skipped\n'
var FAIL = '  %s failed\n'
var FAIL_DESC = '\n  %s) %s %s:\n'
var FAIL_LOG = '%s'

function format (s, args, color) {
  function go (acc, rem, _args) {
    if (rem.length === 0) { return acc }
    var idx = rem.indexOf('%s')
    if (idx === -1 || _args.length === 0) { return acc + rem }
    return go(acc + rem.slice(0, idx) + _args[0], rem.slice(idx + 2), _args.slice(1))
  }
  var result = go('', s, args)
  return color ? result[color] : result
}

function formatDuration (ms) {
  if (ms >= day) { return Math.round(ms / day) + 'd' }
  if (ms >= hour) { return Math.round(ms / hour) + 'h' }
  if (ms >= minute) { return Math.round(ms / minute) + 'm' }
  if (ms >= second) { return Math.round(ms / second) + 's' }
  return ms + 'ms'
}

function formatFailures (failures, formatError, useColors) {
  return failures.reduce(function (acc, failure, idx) {
    return acc
      .concat(format(FAIL_DESC, [idx + 1, failure.suite.join(' '), failure.description], useColors && 'red'))
      .concat(failure.log.reduce(function (logAcc, log) {
        return logAcc.concat(format(FAIL_LOG, [formatError(log, '      ').replace(/\\n/g, '\n')], useColors && 'grey'))
      }, ''))
  }, '')
}

/**
 * Format test results.
 *
 * @param {object} opts Options
 * @param {number} opts.passed Number of passing tests
 * @param {number} opts.skipped Number of skipped tests
 * @param {object[]} opts.failures List of failures
 * @param {number} opts.duration Total test duration (ms)
 * @param {function} opts.formatError Error formatter function
 * @param {boolean} opts.useColors Use colors?
 * @return {string}
 */
exports.formatResults = function (opts) {
  return '\n'
    .concat(format(PASS, [opts.passed], opts.useColors && 'green'))
    .concat(format(TIME, [formatDuration(opts.duration)], opts.useColors && 'grey'))
    .concat(opts.skipped
      ? format(SKIP, [opts.skipped], opts.useColors && 'cyan')
      : ''
    )
    .concat(opts.failures.length
      ? format(FAIL, [opts.failures.length], opts.useColors && 'red')
        .concat(formatFailures(opts.failures, opts.formatError, opts.useColors))
      : ''
    )
    .concat('\n')
}
