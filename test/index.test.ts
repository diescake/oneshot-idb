import { imageUri } from './testData'
import { readData, writeData } from '@/index.ts'

// NOTE: Jest(Node.js) doesn't support indexedDB.
// eslint-disable-next-line import/no-extraneous-dependencies
require('fake-indexeddb/auto')

describe('Oneshot IndexedDB', () => {
  describe('Write data', () => {
    it('Array', async () => {
      const ret = await writeData(['hoge', 'foo', 'bar', 'buz'])
      expect(ret).toBe(true)
    })
  })

  describe('Write and read data', () => {
    console.error = jest.fn() // prevent correct console.error

    it('string', async () => {
      await writeData('hoge')
      const ret = await readData()
      expect(ret).toBe('hoge')

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('number', async () => {
      await writeData(12345.6)
      const ret = await readData()
      expect(ret).toBe(12345.6)

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('boolean', async () => {
      await writeData(true)
      const ret = await readData()
      expect(ret).toBe(true)

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('null', async () => {
      await writeData(null)
      const ret = await readData()
      expect(ret).toBeNull()

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('Array', async () => {
      await writeData(['hoge', 1, 'foo', true, null])
      const ret = await readData()
      expect(ret).toEqual(['hoge', 1, 'foo', true, null])

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('function (expect failed)', async () => {
      const func = () => 12345
      await writeData(func)
      const ret = (await readData()) as Function

      expect(ret).toBeNull()

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('Object', async () => {
      await writeData({ abc: 1, def: 'ghi' })
      const ret = await readData()
      expect(ret).toEqual({ abc: 1, def: 'ghi' })

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('nested Object', async () => {
      await writeData({ abc: 1, def: 'ghi', jkl: { mno: [1, 2, 'foo'] } })
      const ret = await readData()
      expect(ret).toEqual({ abc: 1, def: 'ghi', jkl: { mno: [1, 2, 'foo'] } })

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })

    it('1MB image data uri', async () => {
      await writeData(imageUri)
      const ret = await readData()
      expect(ret).toEqual(imageUri)

      const ret2 = await readData()
      expect(ret2).toBeNull()
    })
  })
})
