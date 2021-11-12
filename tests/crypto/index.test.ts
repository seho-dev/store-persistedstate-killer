/**
 * @jest-environment jsdom
 */

import crypto from '../../src/crypto'

describe('构造测试', () => {
  const _crypto = new crypto()
  it('first', () => {
    console.log(_crypto)
  })
})
