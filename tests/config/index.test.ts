/**
 * @jest-environment jsdom
 */

import { hitStore, defineConfig } from '../../src/config'

describe('命中仓库测试', () => {
  it('include 和 exclude 都为空', () => {
    expect(hitStore('test')).toBe(true)
  })
  it('include 为空', () => {
    defineConfig({
      exclude: ['nihao']
    })
    expect(hitStore('test')).toBe(true)
  })
  it('include 不为空，但是会命中值', () => {
    defineConfig({
      include: ['test']
    })
    expect(hitStore('test')).toBe(true)
  })
  it('include 不为空，但是不会命中值', () => {
    defineConfig({
      include: ['aaa']
    })
    expect(hitStore('test')).toBe(false)
  })
  it('exclude 为空', () => {
    defineConfig({
      include: ['aaa']
    })
    expect(hitStore('test')).toBe(false)
  })
  it('exclude 不为空，但是不会命中值', () => {
    defineConfig({
      exclude: ['aaa']
    })
    expect(hitStore('test')).toBe(true)
  })
  it('exclude 不为空，但是会命中值', () => {
    defineConfig({
      exclude: ['test']
    })
    expect(hitStore('test')).toBe(false)
  })
})
