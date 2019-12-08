const DB_NAME = 'oneShotIDB'
const STORE_NAME = 'defaultStore'
const TARGET_KEY = 0

interface KVSRecord {
  key: number
  data: unknown
}

// NOTE: Unfortunately, the current typeScript compiler doesn't support inference of IDBOpenRequest and its result.
const getResultFromEvent = (event: Event): unknown => (event.target as IDBOpenDBRequest).result

const idbCreate = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const openReq = indexedDB.open(DB_NAME, 1)

    openReq.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = getResultFromEvent(event) as IDBDatabase
      db.createObjectStore(STORE_NAME, {
        keyPath: 'key',
      })
    }

    openReq.onsuccess = (event: Event) => resolve(getResultFromEvent(event) as IDBDatabase)
    openReq.onerror = () => reject(new Error('IndexedDB open failed.'))
  })

const idbGet = (db: IDBDatabase, key: number) =>
  new Promise<KVSRecord>((resolve, reject) => {
    const trans = db.transaction(STORE_NAME, 'readonly')
    const store = trans.objectStore(STORE_NAME)
    const getReq = store.get(key)

    getReq.onsuccess = (event: Event) => resolve(getResultFromEvent(event) as KVSRecord)
    getReq.onerror = () => reject(new Error('IndexedDB get failed.'))
  })

const idbPut = (db: IDBDatabase, record: KVSRecord) =>
  new Promise((resolve, reject) => {
    const trans = db.transaction(STORE_NAME, 'readwrite')
    const store = trans.objectStore(STORE_NAME)
    const putReq = store.put(record)

    putReq.onsuccess = () => resolve()
    putReq.onerror = () => reject(new Error('IndexedDB put failed.'))
  })

const dbDelete = () =>
  new Promise((resolve, reject) => {
    const deleteReq = indexedDB.deleteDatabase(DB_NAME)

    deleteReq.onsuccess = () => resolve()
    deleteReq.onerror = () => reject(new Error('IndexedDB delete failed.'))
  })

export const writeData = async (data: unknown) => {
  let db: IDBDatabase | null = null

  try {
    await dbDelete()

    db = await idbCreate()
    await idbPut(db, { key: TARGET_KEY, data })
    db.close()

    return true
  } catch (e) {
    console.error(e)
    if (db) {
      db.close()
    }
    return false
  }
}

export const readData = async () => {
  let db: IDBDatabase | null = null

  try {
    db = await idbCreate()
    const record = await idbGet(db, TARGET_KEY)
    db.close()

    await dbDelete()

    return record.data
  } catch (e) {
    console.error(e)
    if (db) {
      db.close()
    }
    return null
  }
}
