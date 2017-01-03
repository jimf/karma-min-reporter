/* global describe, it, xit, expect */
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      expect([1, 2, 3].indexOf(4)).toBe(-1)
    })
    xit('should return index of present value', function () {
      expect([1, 2, 3].indexOf(1)).toBe(0)
    })
  })
})
