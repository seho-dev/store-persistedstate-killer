/**
 * @jest-environment jsdom
 */

import crypto from '../../src/crypto'

describe('构造测试', () => {
  const _crypto = new crypto()
  it('加密测试1', () => {
    const message = 'hello, world'
    const encryptData = _crypto.encrypt(message)
    if (encryptData) {
      const decrypt = _crypto.decrypt(encryptData)
      console.log('解密结果', decrypt)
      expect(decrypt).toBe(message)
    } else {
      throw Error('加密错误')
    }
  })
  it('加密测试2', () => {
    const message = JSON.stringify({ hello: 'nihao', user: 'seho', age: 88 })
    const encryptData = _crypto.encrypt(message)
    if (encryptData) {
      const decrypt = _crypto.decrypt(encryptData)
      console.log('解密结果', decrypt)
      expect(decrypt).toBe(message)
    } else {
      throw Error('加密错误')
    }
  })
})
